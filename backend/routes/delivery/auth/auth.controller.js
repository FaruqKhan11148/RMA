const crypto = require('crypto');

const RMA_DELIVERY_AGREEMENT_VERSION = 'RMA-DP-1.0';
const DeliveryPerson = require('../../../models/DeliveryPerson');
const Owner = require('../../../models/Owner');
const LoginAttempt = require('../../../models/LoginAttempt');

const bcrypt = require('bcryptjs');

// ==========================================
// REGISTER SHOP DELIVERY PERSON
// ==========================================
const registerDeliveryPerson = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const shopId = req.owner.shopId;

    // VALIDATION
    if (!name || !phone) {
      return res.status(400).json({
        message: 'Name and phone are required',
      });
    }

    // FIND SHOP
    const owner = await Owner.findOne({ shopId });

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    // CHECK IF DELIVERY PERSON ALREADY EXISTS
    const existingDeliveryPerson = await DeliveryPerson.findOne({
      shopId,
    });

    if (existingDeliveryPerson) {
      return res.status(409).json({
        message: 'A delivery person is already registered for this shop',
      });
    }

    // CHECK PHONE
    const existingPhone = await DeliveryPerson.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: 'This phone number is already registered',
      });
    }

    // CREATE DELIVERY PERSON
    const deliveryPerson = await DeliveryPerson.create({
      ownerId: owner._id,
      shopId: owner.shopId,
      name,
      phone,
      isActive: true,
    });

    // SAFE RESPONSE
    return res.status(201).json({
      message: 'Delivery person registered successfully',

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Register delivery person error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REGISTER RMA DELIVERY PARTNER
// ==========================================

const registerRmaDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();

    if (!trimmedName || !trimmedPhone || !password) {
      return res.status(400).json({
        message: 'Name, phone and password are required',
      });
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit mobile number',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    const existingDeliveryPerson = await DeliveryPerson.findOne({
      phone: trimmedPhone,
    });

    if (existingDeliveryPerson) {
      return res.status(409).json({
        message: 'A delivery partner with this phone number already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const deliveryPerson = await DeliveryPerson.create({
      deliveryType: 'RMA',
      ownerId: null,
      shopId: null,
      name: trimmedName,
      phone: trimmedPhone,
      passwordHash,

      isActive: false,
      applicationStatus: 'INCOMPLETE',
      submittedAt: null,
      availabilityStatus: 'OFFLINE',
    });

    return res.status(201).json({
      message: 'RMA delivery partner registered successfully',
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
        submittedAt: deliveryPerson.submittedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner registration error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_LOCK_MS = 30 * 1000;
const LOGIN_RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function getRmaDeliveryLoginAttemptKey(phone, ip) {
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  return `rma-delivery:${normalizedPhone}:${ip}`;
}

async function getLoginAttemptRecord(key) {
  return LoginAttempt.findOne({ key });
}

async function recordFailedLogin(key) {
  const now = new Date();

  let attempt = await LoginAttempt.findOne({ key });

  if (!attempt) {
    try {
      attempt = await LoginAttempt.create({
        key,
        failedAttempts: 1,
        lockedUntil: null,
        expiresAt: new Date(Date.now() + LOGIN_RECORD_TTL_MS),
      });
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }

      attempt = await LoginAttempt.findOne({ key });

      if (!attempt) {
        throw error;
      }

      attempt.failedAttempts += 1;
      attempt.expiresAt = new Date(Date.now() + LOGIN_RECORD_TTL_MS);
    }
  } else {
    attempt.failedAttempts += 1;
    attempt.expiresAt = new Date(Date.now() + LOGIN_RECORD_TTL_MS);
  }

  if (attempt.failedAttempts >= LOGIN_MAX_ATTEMPTS) {
    attempt.lockedUntil = new Date(now.getTime() + LOGIN_LOCK_MS);
    attempt.failedAttempts = 0;
  }

  await attempt.save();

  return attempt;
}

async function clearFailedLogins(key) {
  await LoginAttempt.deleteOne({ key });
}

/* ==========================================
   RMA DELIVERY PARTNER PASSWORD LOGIN
========================================== */
const loginRmaDeliveryPartner = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (
      !/^\d{10}$/.test(trimmedPhone) ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Valid 10-digit phone number and password are required',
      });
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const attemptKey = getRmaDeliveryLoginAttemptKey(trimmedPhone, ip);

    const existingAttempt = await getLoginAttemptRecord(attemptKey);
    const now = Date.now();

    // Reject login attempts while the account/IP combination is locked.
    if (
      existingAttempt?.lockedUntil &&
      existingAttempt.lockedUntil.getTime() > now
    ) {
      const retryAfterSeconds = Math.ceil(
        (existingAttempt.lockedUntil.getTime() - now) / 1000,
      );

      res.set('Retry-After', String(retryAfterSeconds));

      return res.status(429).json({
        code: 'LOGIN_TEMPORARILY_LOCKED',
        message: 'Too many failed attempts. Please try again later.',
        retryAfterSeconds,
      });
    }

    // Remove an expired lockout before starting a fresh attempt cycle.
    if (
      existingAttempt?.lockedUntil &&
      existingAttempt.lockedUntil.getTime() <= now
    ) {
      await LoginAttempt.deleteOne({ key: attemptKey });
    }

    // Only find RMA delivery partners, never shop delivery accounts.
    const deliveryPerson = await DeliveryPerson.findOne({
      phone: trimmedPhone,
      deliveryType: 'RMA',
    }).select('+passwordHash');

    const passwordMatch =
      deliveryPerson?.passwordHash &&
      (await bcrypt.compare(password, deliveryPerson.passwordHash));

    // Keep the response generic so login doesn't reveal registered phones.
    if (!deliveryPerson || !passwordMatch) {
      const attempt = await recordFailedLogin(attemptKey);

      if (attempt.lockedUntil) {
        res.set('Retry-After', '30');

        return res.status(429).json({
          code: 'LOGIN_TEMPORARILY_LOCKED',
          message: 'Too many failed attempts. Please try again in 30 seconds.',
          retryAfterSeconds: 30,
        });
      }

      return res.status(401).json({
        message: 'Invalid phone number or password',
        remainingAttempts: Math.max(
          0,
          LOGIN_MAX_ATTEMPTS - attempt.failedAttempts,
        ),
      });
    }

    // Correct credentials: clear failed attempts for this key.
    await clearFailedLogins(attemptKey);

    if (deliveryPerson.applicationStatus === 'REJECTED') {
      return res.status(403).json({
        message: 'Your RMA delivery partner application was rejected',
      });
    }

    // Allow INCOMPLETE and UNDER_REVIEW partners to log in.
    const loginToken = crypto.randomBytes(32).toString('hex');

    deliveryPerson.loginToken = loginToken;
    deliveryPerson.loginTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    // Clear any old OTP on this RMA account.
    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Login successful',
      token: loginToken,
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner password login error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// REQUEST DELIVERY LOGIN OTP
// ==========================================
const requestDeliveryOtp = async (req, res) => {
  try {
    const { shopId, phone } = req.body;

    // VALIDATION
    if (!shopId || !phone) {
      return res.status(400).json({
        message: 'Shop ID and phone are required',
      });
    }

    // FIND DELIVERY PERSON
    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    // CHECK ACTIVE
    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // GENERATE 6 DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP VALID FOR 5 MINUTES
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    deliveryPerson.otp = otp;
    deliveryPerson.otpExpiresAt = otpExpiresAt;

    await deliveryPerson.save();

    // console.log(`Delivery login OTP for ${phone}: ${otp}`);

    return res.status(200).json({
      message: 'OTP sent successfully',

      // ONLY FOR LOCAL TESTING
      // Remove this in production.
      otp,
    });
  } catch (error) {
    console.error('Request delivery OTP error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ==========================================
// LOGOUT DELIVERY PERSON
// ==========================================
const logoutDeliveryPerson = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    deliveryPerson.loginToken = null;
    deliveryPerson.loginTokenExpiresAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Delivery person logout successful',
    });
  } catch (error) {
    console.error('Delivery logout failed:', error);
    return res.status(500).json({
      message: 'Unable to logout delivery person',
    });
  }
};

// ==========================================
// VERIFY DELIVERY PERSON LOGIN OTP
// ==========================================
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { shopId, phone, otp } = req.body;

    if (!shopId || !phone || !otp) {
      return res.status(400).json({
        message: 'Shop ID, phone and OTP are required',
      });
    }

    const deliveryPerson = await DeliveryPerson.findOne({
      shopId,
      phone,
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'Delivery person not found for this shop',
      });
    }

    if (!deliveryPerson.isActive) {
      return res.status(403).json({
        message: 'Delivery person account is inactive',
      });
    }

    // Check whether an OTP was requested
    if (!deliveryPerson.otp || !deliveryPerson.otpExpiresAt) {
      return res.status(400).json({
        message: 'No OTP requested',
      });
    }

    // Check OTP expiry
    if (new Date() > deliveryPerson.otpExpiresAt) {
      deliveryPerson.otp = null;
      deliveryPerson.otpExpiresAt = null;

      await deliveryPerson.save();

      return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP',
      });
    }

    // Check OTP
    if (deliveryPerson.otp !== String(otp)) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    // Generate secure login token
    const loginToken = crypto.randomBytes(32).toString('hex');

    // Login session valid for 7 days
    const loginTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    deliveryPerson.otp = null;
    deliveryPerson.otpExpiresAt = null;
    deliveryPerson.loginToken = loginToken;
    deliveryPerson.loginTokenExpiresAt = loginTokenExpiresAt;

    await deliveryPerson.save();

    res.status(200).json({
      message: 'Delivery person login successful',

      token: loginToken,

      deliveryPerson: {
        id: deliveryPerson._id,
        shopId: deliveryPerson.shopId,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        isActive: deliveryPerson.isActive,
      },
    });
  } catch (error) {
    console.error('Verify delivery login OTP error:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// GET RMA DELIVERY PARTNER APPLICATION
const getRmaDeliveryApplication = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    if (deliveryPerson.deliveryType !== 'RMA') {
      return res.status(403).json({
        message: 'This account is not an RMA delivery partner',
      });
    }

    return res.status(200).json({
      application: {
        id: deliveryPerson._id,

        name: deliveryPerson.name,
        phone: deliveryPerson.phone,

        profile: deliveryPerson.profile,
        address: deliveryPerson.address,

        kyc: deliveryPerson.kyc
          ? {
              documentType: deliveryPerson.kyc.documentType,
              documentNumber: deliveryPerson.kyc.documentNumber,
              status: deliveryPerson.kyc.status,
              frontImageUrl: deliveryPerson.kyc.frontImageUrl,
              backImageUrl: deliveryPerson.kyc.backImageUrl,
              selfieImageUrl: deliveryPerson.kyc.selfieImageUrl,
              rejectionReason: deliveryPerson.kyc.rejectionReason,
              verifiedAt: deliveryPerson.kyc.verifiedAt,
            }
          : null,

        drivingLicence: deliveryPerson.drivingLicence
          ? {
              number: deliveryPerson.drivingLicence.number,
              expiryDate: deliveryPerson.drivingLicence.expiryDate,
              status: deliveryPerson.drivingLicence.status,
              frontImageUrl: deliveryPerson.drivingLicence.frontImageUrl,
              backImageUrl: deliveryPerson.drivingLicence.backImageUrl,
              rejectionReason: deliveryPerson.drivingLicence.rejectionReason,
              verifiedAt: deliveryPerson.drivingLicence.verifiedAt,
            }
          : null,

        vehicle: deliveryPerson.vehicle,

        bankAccount: deliveryPerson.bankAccount
          ? {
              accountHolderName: deliveryPerson.bankAccount.accountHolderName,
              accountNumber: deliveryPerson.bankAccount.accountNumber,
              ifsc: deliveryPerson.bankAccount.ifsc,
              bankName: deliveryPerson.bankAccount.bankName,
              paymentUpiId: deliveryPerson.bankAccount.paymentUpiId || '',
              proofImageUrl: deliveryPerson.bankAccount.proofImageUrl,
              status: deliveryPerson.bankAccount.status,
              rejectionReason: deliveryPerson.bankAccount.rejectionReason,
              verifiedAt: deliveryPerson.bankAccount.verifiedAt,
            }
          : null,

        applicationStatus: deliveryPerson.applicationStatus,
        submittedAt: deliveryPerson.submittedAt,
        correctionReason: deliveryPerson.correctionReason,
        rejectionReason: deliveryPerson.rejectionReason,
        reviewedAt: deliveryPerson.reviewedAt,

        // RMA Delivery Partner Agreement
        agreement: {
          accepted: deliveryPerson.agreement?.accepted === true,
          version: deliveryPerson.agreement?.version || null,
          acceptedAt: deliveryPerson.agreement?.acceptedAt || null,
        },
      },
    });
  } catch (error) {
    console.error('Get RMA delivery application error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// UPDATE RMA DELIVERY PARTNER APPLICATION
const updateRmaDeliveryApplication = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    if (deliveryPerson.deliveryType !== 'RMA') {
      return res.status(403).json({
        message: 'This account is not an RMA delivery partner',
      });
    }

    const { section, data } = req.body;

    if (!section || !data || typeof data !== 'object') {
      return res.status(400).json({
        message: 'Section and data are required',
      });
    }

    const allowedSections = [
      'profile',
      'address',
      'kyc',
      'drivingLicence',
      'vehicle',
      'bankAccount',
    ];

    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        message: 'Invalid application section',
      });
    }

    // Approved partners may update only their UPI ID.
    // All other application edits remain blocked.
    const isApproved = deliveryPerson.applicationStatus === 'APPROVED';
    const isUpiOnlyUpdate =
      section === 'bankAccount' &&
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.keys(data).length === 1 &&
      Object.keys(data)[0] === 'paymentUpiId';

    if (isApproved && !isUpiOnlyUpdate) {
      return res.status(403).json({
        message: 'Approved applications can update their UPI ID only.',
      });
    }

    // ------------------------------------------
    // PROFILE
    // ------------------------------------------
    if (section === 'profile') {
      if (data.dateOfBirth !== undefined) {
        const dateOfBirth = new Date(data.dateOfBirth);

        if (Number.isNaN(dateOfBirth.getTime())) {
          return res.status(400).json({
            message: 'Invalid date of birth',
          });
        }

        deliveryPerson.profile.dateOfBirth = dateOfBirth;
      }

      if (data.profilePhotoUrl !== undefined) {
        deliveryPerson.profile.profilePhotoUrl = String(
          data.profilePhotoUrl,
        ).trim();
      }
    }

    // ------------------------------------------
    // ADDRESS
    // ------------------------------------------
    if (section === 'address') {
      if (data.addressLine !== undefined) {
        deliveryPerson.address.addressLine = String(data.addressLine).trim();
      }

      if (data.city !== undefined) {
        deliveryPerson.address.city = String(data.city).trim();
      }

      if (data.state !== undefined) {
        deliveryPerson.address.state = String(data.state).trim();
      }

      if (data.pincode !== undefined) {
        deliveryPerson.address.pincode = String(data.pincode).trim();
      }
    }

    // ------------------------------------------
    // KYC
    // ------------------------------------------
    if (section === 'kyc') {
      if (data.documentType !== undefined) {
        deliveryPerson.kyc.documentType = String(data.documentType).trim();
      }

      if (data.documentNumber !== undefined) {
        deliveryPerson.kyc.documentNumber = String(data.documentNumber).trim();
      }

      if (data.frontImageUrl !== undefined) {
        deliveryPerson.kyc.frontImageUrl = String(data.frontImageUrl).trim();
      }

      if (data.backImageUrl !== undefined) {
        deliveryPerson.kyc.backImageUrl = String(data.backImageUrl).trim();
      }

      if (data.selfieImageUrl !== undefined) {
        deliveryPerson.kyc.selfieImageUrl = String(data.selfieImageUrl).trim();
      }

      deliveryPerson.kyc.status = 'PENDING';
      deliveryPerson.kyc.rejectionReason = null;
    }

    // ------------------------------------------
    // DRIVING LICENCE
    // ------------------------------------------
    if (section === 'drivingLicence') {
      if (data.number !== undefined) {
        deliveryPerson.drivingLicence.number = String(data.number).trim();
      }

      if (data.frontImageUrl !== undefined) {
        deliveryPerson.drivingLicence.frontImageUrl = String(
          data.frontImageUrl,
        ).trim();
      }

      if (data.backImageUrl !== undefined) {
        deliveryPerson.drivingLicence.backImageUrl = String(
          data.backImageUrl,
        ).trim();
      }

      if (data.expiryDate !== undefined) {
        const expiryDate = new Date(data.expiryDate);

        if (Number.isNaN(expiryDate.getTime())) {
          return res.status(400).json({
            message: 'Invalid driving licence expiry date',
          });
        }

        deliveryPerson.drivingLicence.expiryDate = expiryDate;
      }

      deliveryPerson.drivingLicence.status = 'PENDING';
      deliveryPerson.drivingLicence.rejectionReason = null;
    }

    // ------------------------------------------
    // VEHICLE
    // ------------------------------------------
    if (section === 'vehicle') {
      if (data.type !== undefined) {
        const vehicleTypes = ['BIKE', 'SCOOTER', 'OTHER'];

        if (!vehicleTypes.includes(data.type)) {
          return res.status(400).json({
            message: 'Invalid vehicle type',
          });
        }

        deliveryPerson.vehicle.type = data.type;
      }

      if (data.registrationNumber !== undefined) {
        deliveryPerson.vehicle.registrationNumber = String(
          data.registrationNumber,
        )
          .trim()
          .toUpperCase();
      }

      if (data.rcImageUrl !== undefined) {
        deliveryPerson.vehicle.rcImageUrl = String(data.rcImageUrl).trim();
      }

      if (data.insuranceImageUrl !== undefined) {
        deliveryPerson.vehicle.insuranceImageUrl = String(
          data.insuranceImageUrl,
        ).trim();
      }

      if (data.insuranceExpiry !== undefined) {
        const insuranceExpiry = new Date(data.insuranceExpiry);

        if (Number.isNaN(insuranceExpiry.getTime())) {
          return res.status(400).json({
            message: 'Invalid insurance expiry date',
          });
        }

        deliveryPerson.vehicle.insuranceExpiry = insuranceExpiry;
      }

      if (data.pucImageUrl !== undefined) {
        deliveryPerson.vehicle.pucImageUrl = String(data.pucImageUrl).trim();
      }

      if (data.pucExpiry !== undefined) {
        const pucExpiry = new Date(data.pucExpiry);

        if (Number.isNaN(pucExpiry.getTime())) {
          return res.status(400).json({
            message: 'Invalid PUC expiry date',
          });
        }

        deliveryPerson.vehicle.pucExpiry = pucExpiry;
      }

      deliveryPerson.vehicle.status = 'PENDING';
      deliveryPerson.vehicle.rejectionReason = null;
    }

    // ------------------------------------------
    // BANK ACCOUNT
    // ------------------------------------------
    if (section === 'bankAccount') {
      if (data.paymentUpiId !== undefined) {
        const paymentUpiId = String(data.paymentUpiId).trim().toLowerCase();

        if (
          paymentUpiId.length > 100 ||
          !/^[a-z0-9][a-z0-9._-]{1,254}@[a-z0-9][a-z0-9.-]{1,63}$/.test(
            paymentUpiId,
          )
        ) {
          return res.status(400).json({
            message: 'Please enter a valid UPI ID.',
          });
        }

        deliveryPerson.bankAccount.paymentUpiId = paymentUpiId;
      }

      if (data.accountHolderName !== undefined) {
        deliveryPerson.bankAccount.accountHolderName = String(
          data.accountHolderName,
        ).trim();
      }

      if (data.accountNumber !== undefined) {
        deliveryPerson.bankAccount.accountNumber = String(
          data.accountNumber,
        ).trim();
      }

      if (data.ifsc !== undefined) {
        deliveryPerson.bankAccount.ifsc = String(data.ifsc)
          .trim()
          .toUpperCase();
      }

      if (data.bankName !== undefined) {
        deliveryPerson.bankAccount.bankName = String(data.bankName).trim();
      }

      if (data.proofImageUrl !== undefined) {
        deliveryPerson.bankAccount.proofImageUrl = String(
          data.proofImageUrl,
        ).trim();
      }

      // Changing only the UPI ID must not reset bank verification.
      if (!isUpiOnlyUpdate) {
        deliveryPerson.bankAccount.status = 'PENDING';
        deliveryPerson.bankAccount.rejectionReason = null;
      }
    }

    // If an application was sent back for corrections,
    // saving changes puts it back into UNDER_REVIEW later
    // only when the applicant explicitly submits it.
    if (deliveryPerson.applicationStatus === 'CORRECTION_REQUIRED') {
      deliveryPerson.applicationStatus = 'INCOMPLETE';
      deliveryPerson.correctionReason = null;
    }

    await deliveryPerson.save();

    return res.status(200).json({
      message: `${section} section saved successfully`,
      section,
      applicationStatus: deliveryPerson.applicationStatus,
    });
  } catch (error) {
    console.error('Update RMA delivery application error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ACCEPT RMA DELIVERY PARTNER AGREEMENT
const acceptRmaDeliveryAgreement = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    if (deliveryPerson.deliveryType !== 'RMA') {
      return res.status(403).json({
        message: 'This account is not an RMA delivery partner',
      });
    }

    if (deliveryPerson.applicationStatus === 'APPROVED') {
      return res.status(400).json({
        message: 'Your application has already been approved',
      });
    }

    if (
      deliveryPerson.applicationStatus === 'SUBMITTED' ||
      deliveryPerson.applicationStatus === 'UNDER_REVIEW'
    ) {
      return res.status(400).json({
        message: 'Your application has already been submitted for review',
      });
    }

    if (deliveryPerson.applicationStatus === 'REJECTED') {
      return res.status(400).json({
        message: 'This application cannot accept the agreement',
      });
    }

    // Record acceptance using the server's timestamp.
    deliveryPerson.agreement = {
      accepted: true,
      version: RMA_DELIVERY_AGREEMENT_VERSION,
      acceptedAt: new Date(),
    };

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'RMA Delivery Partner Agreement accepted successfully',
      agreement: {
        accepted: deliveryPerson.agreement.accepted,
        version: deliveryPerson.agreement.version,
        acceptedAt: deliveryPerson.agreement.acceptedAt,
      },
    });
  } catch (error) {
    console.error('Accept RMA delivery agreement error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

const submitRmaDeliveryApplication = async (req, res) => {
  try {
    const deliveryPerson = req.deliveryPerson;

    if (!deliveryPerson) {
      return res.status(401).json({
        message: 'Delivery partner authentication required',
      });
    }

    if (deliveryPerson.deliveryType !== 'RMA') {
      return res.status(403).json({
        message: 'This account is not an RMA delivery partner',
      });
    }

    if (deliveryPerson.applicationStatus === 'APPROVED') {
      return res.status(400).json({
        message: 'Your application has already been approved',
      });
    }

    if (
      deliveryPerson.applicationStatus === 'SUBMITTED' ||
      deliveryPerson.applicationStatus === 'UNDER_REVIEW'
    ) {
      return res.status(400).json({
        message: 'Your application has already been submitted for review',
      });
    }

    const missingFields = [];

    // ------------------------------------------
    // PROFILE
    // ------------------------------------------
    if (!deliveryPerson.profile?.dateOfBirth) {
      missingFields.push('Date of birth');
    }

    if (!deliveryPerson.profile?.profilePhotoUrl) {
      missingFields.push('Profile photo');
    }

    // ------------------------------------------
    // ADDRESS
    // ------------------------------------------
    if (!deliveryPerson.address?.addressLine) {
      missingFields.push('Address');
    }

    if (!deliveryPerson.address?.city) {
      missingFields.push('City');
    }

    if (!deliveryPerson.address?.state) {
      missingFields.push('State');
    }

    if (!deliveryPerson.address?.pincode) {
      missingFields.push('Pincode');
    }

    // ------------------------------------------
    // KYC
    // ------------------------------------------
    if (!deliveryPerson.kyc?.documentType) {
      missingFields.push('KYC document type');
    }

    if (!deliveryPerson.kyc?.documentNumber) {
      missingFields.push('KYC document number');
    }

    if (!deliveryPerson.kyc?.frontImageUrl) {
      missingFields.push('KYC front image');
    }

    if (!deliveryPerson.kyc?.backImageUrl) {
      missingFields.push('KYC back image');
    }

    if (!deliveryPerson.kyc?.selfieImageUrl) {
      missingFields.push('KYC selfie');
    }

    // ------------------------------------------
    // DRIVING LICENCE
    // ------------------------------------------
    if (!deliveryPerson.drivingLicence?.number) {
      missingFields.push('Driving licence number');
    }

    if (!deliveryPerson.drivingLicence?.frontImageUrl) {
      missingFields.push('Driving licence front image');
    }

    if (!deliveryPerson.drivingLicence?.backImageUrl) {
      missingFields.push('Driving licence back image');
    }

    if (!deliveryPerson.drivingLicence?.expiryDate) {
      missingFields.push('Driving licence expiry date');
    }

    // ------------------------------------------
    // VEHICLE
    // ------------------------------------------
    if (!deliveryPerson.vehicle?.type) {
      missingFields.push('Vehicle type');
    }

    if (!deliveryPerson.vehicle?.registrationNumber) {
      missingFields.push('Vehicle registration number');
    }

    if (!deliveryPerson.vehicle?.rcImageUrl) {
      missingFields.push('RC document');
    }

    // ------------------------------------------
    // BANK
    // ------------------------------------------
    if (!deliveryPerson.bankAccount?.accountHolderName) {
      missingFields.push('Bank account holder name');
    }

    if (!deliveryPerson.bankAccount?.paymentUpiId) {
      missingFields.push('UPI ID');
    }

    if (!deliveryPerson.bankAccount?.accountNumber) {
      missingFields.push('Bank account number');
    }

    if (!deliveryPerson.bankAccount?.ifsc) {
      missingFields.push('IFSC');
    }

    if (!deliveryPerson.bankAccount?.bankName) {
      missingFields.push('Bank name');
    }

    if (!deliveryPerson.bankAccount?.proofImageUrl) {
      missingFields.push('Bank proof');
    }

    // ------------------------------------------
    // VALIDATION RESULT
    // ------------------------------------------
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Please complete your application before submitting',
        missingFields,
      });
    }

    // ------------------------------------------
    // AGREEMENT ACCEPTANCE
    // ------------------------------------------
    if (
      deliveryPerson.agreement?.accepted !== true ||
      deliveryPerson.agreement?.version !== RMA_DELIVERY_AGREEMENT_VERSION ||
      !deliveryPerson.agreement?.acceptedAt
    ) {
      return res.status(400).json({
        message:
          'Please read and accept the current RMA Delivery Partner Agreement before submitting.',
        missingFields: ['RMA Delivery Partner Agreement'],
        requiresAgreement: true,
      });
    }

    // ------------------------------------------
    // SUBMIT
    // ------------------------------------------
    deliveryPerson.applicationStatus = 'UNDER_REVIEW';
    deliveryPerson.submittedAt = new Date();
    deliveryPerson.correctionReason = null;
    deliveryPerson.rejectionReason = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Application submitted successfully for review',

      application: {
        id: deliveryPerson._id,
        applicationStatus: deliveryPerson.applicationStatus,
        submittedAt: deliveryPerson.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submit RMA delivery application error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  registerDeliveryPerson,
  registerRmaDeliveryPartner,
  requestDeliveryOtp,
  logoutDeliveryPerson,
  verifyDeliveryOtp,
  getRmaDeliveryApplication,
  updateRmaDeliveryApplication,
  submitRmaDeliveryApplication,
  acceptRmaDeliveryAgreement,
  loginRmaDeliveryPartner,
};
