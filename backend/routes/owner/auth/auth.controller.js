const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const OwnerPasswordReset = require('../../../models/OwnerPasswordReset');
const { sendPasswordResetEmail } = require('../../../services/emailService');

const Owner = require('../../../models/Owner');
const Counter = require('../../../models/Counter');
const getShopStatus = require('../../../utils/shopStatus');
const Referral = require('../../../models/Referral');
const LoginAttempt = require('../../../models/LoginAttempt');

// REGISTER OWNER
async function registerOwner(req, res) {
  try {
    const {
      ownerName,
      shopName,
      description,
      address,
      phone,
      email,
      password,
      delivery,
      pickup,
      products,
      location,
      referralCode,
      upiAccountHolderName,
      upiMobileNumber,
      upiId,
      termsAccepted,
      termsVersion,
    } = req.body;

    // Validate Shop Owner Agreement acceptance
    if (termsAccepted !== true || termsVersion !== 'owner-terms-v1') {
      return res.status(400).json({
        message:
          'Please accept the current Shop Owner Agreement and Privacy Policy to continue.',
      });
    }

    // Check required fields
    if (!ownerName || !shopName || !email || !address || !phone || !password) {
      return res.status(400).json({
        message: 'Required fields are missing',
      });
    }

    const normalizedUpiAccountHolderName =
      typeof upiAccountHolderName === 'string'
        ? upiAccountHolderName.trim().replace(/\s+/g, ' ')
        : '';

    const normalizedUpiId =
      typeof upiId === 'string' ? upiId.trim().toLowerCase() : '';

    const normalizedUpiMobileNumber =
      typeof upiMobileNumber === 'string'
        ? upiMobileNumber.replace(/\D/g, '')
        : '';

    const upiRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/;

    if (
      !normalizedUpiAccountHolderName ||
      normalizedUpiAccountHolderName.length > 100
    ) {
      return res.status(400).json({
        message:
          'Enter a valid UPI account holder name (maximum 100 characters)',
      });
    }

    if (!/^\d{10}$/.test(normalizedUpiMobileNumber)) {
      return res.status(400).json({
        message: 'Enter a valid 10-digit UPI-linked mobile number',
      });
    }

    if (!upiRegex.test(normalizedUpiId)) {
      return res.status(400).json({
        message: 'Please enter a valid UPI ID',
      });
    }

    // Check whether phone number already exists
    const existingOwner = await Owner.findOne({ phone });

    if (existingOwner) {
      return res.status(409).json({
        message: 'Owner with this phone number already exists',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await Owner.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'Owner with this email already exists',
      });
    }

    // Validate referral code
    let referrerOwner = null;

    if (referralCode && referralCode.trim()) {
      const normalizedReferralCode = referralCode.trim().toUpperCase();

      referrerOwner = await Owner.findOne({
        referralCode: normalizedReferralCode,
      });

      if (!referrerOwner) {
        return res.status(400).json({
          message: 'Invalid referral code',
        });
      }
    }

    // Check products
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: 'Please add at least one product',
      });
    }

    // Check order options
    if (!delivery && !pickup) {
      return res.status(400).json({
        message: 'Please select at least one order type',
      });
    }

    // Check shop location
    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return res.status(400).json({
        message: 'Shop location is required',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate next Shop ID
    const counter = await Counter.findOneAndUpdate(
      { name: 'shopId' },
      { $inc: { sequenceValue: 1 } },
      {
        returnDocument: 'after',
        upsert: true,
      },
    );

    const shopId = `RMA-${String(counter.sequenceValue).padStart(6, '0')}`;

    // Create owner
    const owner = await Owner.create({
      shopId,
      ownerName,
      shopName,
      termsAccepted: true,
      termsVersion: 'owner-terms-v1',
      termsAcceptedAt: new Date(),
      description: description || '',
      address,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
      delivery,
      pickup,
      products,

      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },

      // DIRECT OWNER UPI PAYMENT
      payment: {
        provider: 'DIRECT_UPI',

        upiAccountHolderName: normalizedUpiAccountHolderName,
        upiMobileNumber: normalizedUpiMobileNumber,
        upiId: normalizedUpiId,

        rmaApprovalStatus: 'PENDING',
        onboardingStatus: 'NOT_STARTED',
        kycStatus: 'NOT_STARTED',
        bankStatus: 'PENDING',

        payuChildMerchantId: null,
        payuChildMerchantUuid: null,
      },
    });

    // Create permanent referral relationship
    if (referrerOwner) {
      const joinedAt = new Date();

      const qualificationEndDate = new Date(joinedAt);
      qualificationEndDate.setDate(qualificationEndDate.getDate() + 20);

      // Find next referral slot
      const latestReferral = await Referral.findOne({
        referrerOwnerId: referrerOwner._id,
      })
        .sort({
          cycleNumber: -1,
          slotNumber: -1,
        })
        .lean();

      let cycleNumber = 1;
      let slotNumber = 1;

      if (latestReferral) {
        cycleNumber = latestReferral.cycleNumber;
        slotNumber = latestReferral.slotNumber + 1;

        if (slotNumber > 7) {
          cycleNumber += 1;
          slotNumber = 1;
        }
      }

      // Create referral
      await Referral.create({
        referrerOwnerId: referrerOwner._id,
        referredOwnerId: owner._id,
        referralCode: referrerOwner.referralCode,

        cycleNumber,
        slotNumber,

        status: 'REGISTERED',
        joinedAt,

        qualification: {
          startDate: joinedAt,
          endDate: qualificationEndDate,

          requiredOrders: 100,
          referredOwnerOrders: 0,
          referrerOwnerOrders: 0,

          requiredActiveDays: 18,
          referredOwnerActiveDays: 0,
          referrerOwnerActiveDays: 0,

          qualificationDays: 20,
        },
      });
    }

    // Send safe owner data to frontend
    return res.status(201).json({
      message:
        'Registration submitted successfully. Your shop is awaiting RMA admin approval.',

      owner: {
        id: owner._id,
        shopId: owner.shopId,
        registrationStatus: 'PENDING_APPROVAL',
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        isOpen: getShopStatus(owner),
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
        location: owner.location,

        payment: {
          provider: owner.payment.provider,
          upiId: owner.payment.upiId,
          rmaApprovalStatus: owner.payment.rmaApprovalStatus,
        },
      },
    });
  } catch (error) {
    console.error('Owner registration failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_LOCK_MS = 30 * 1000;
const LOGIN_RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function getLoginAttemptKey(phone, ip) {
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  return `owner:${normalizedPhone}:${ip}`;
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
      // Handle simultaneous first attempts for the same key.
      if (error.code !== 11000) {
        throw error;
      }

      attempt = await LoginAttempt.findOne({ key });
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

// OWNER LOGIN

async function loginOwner(req, res) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: 'Phone and password are required',
      });
    }

    const normalizedPhone = String(phone).trim();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const attemptKey = getLoginAttemptKey(normalizedPhone, ip);

    const existingAttempt = await getLoginAttemptRecord(attemptKey);
    const now = Date.now();

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

    // Expired lockout: allow another set of attempts.
    if (
      existingAttempt?.lockedUntil &&
      existingAttempt.lockedUntil.getTime() <= now
    ) {
      await LoginAttempt.deleteOne({ key: attemptKey });
    }

    const owner = await Owner.findOne({ phone: normalizedPhone });

    const passwordMatch =
      owner && typeof password === 'string'
        ? await bcrypt.compare(password, owner.password)
        : false;

    if (!owner || !passwordMatch) {
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

    // Correct credentials: clear previous failed attempts.
    await clearFailedLogins(attemptKey);

    // Preserve the existing owner approval checks.
    const approvalStatus = owner.payment?.rmaApprovalStatus;

    if (approvalStatus === 'PENDING') {
      return res.status(403).json({
        code: 'OWNER_APPROVAL_PENDING',
        message:
          'Your shop registration is awaiting RMA admin approval. You can log in after your registration is approved.',
        registrationStatus: 'PENDING_APPROVAL',
      });
    }

    if (approvalStatus === 'REJECTED') {
      return res.status(403).json({
        code: 'OWNER_REGISTRATION_REJECTED',
        message:
          'Your shop registration was not approved. Please contact RMA support for assistance.',
        registrationStatus: 'REJECTED',
      });
    }

    const token = jwt.sign(
      {
        ownerId: owner._id.toString(),
        shopId: owner.shopId,
        authVersion: owner.authVersion,
      },
      process.env.OWNER_JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      owner: {
        id: owner._id,
        shopId: owner.shopId,
        registrationStatus:
          owner.payment?.rmaApprovalStatus === 'APPROVED'
            ? 'APPROVED'
            : 'LEGACY',
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        email: owner.email,
        isOpen: getShopStatus(owner),
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
        location: owner.location,
        payment: {
          provider: owner.payment?.provider,
          upiId: owner.payment?.upiId || '',
        },
      },
    });
  } catch (error) {
    console.error('Owner login failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

// OWNER LOGOUT
async function logoutOwner(req, res) {
  try {
    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    owner.authVersion += 1;
    await owner.save();

    return res.status(200).json({
      message: 'Owner logout successful',
    });
  } catch (error) {
    console.error('Owner logout failed:', error);

    return res.status(500).json({
      message: 'Unable to logout owner',
    });
  }
}

// SAVE OWNER FCM TOKEN
async function saveOwnerNotificationToken(req, res) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({
        message: 'FCM token is required',
      });
    }

    const owner = await Owner.findById(req.owner._id);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner account not found',
      });
    }

    const trimmedToken = token.trim();

    await Owner.findByIdAndUpdate(owner._id, {
      $addToSet: {
        fcmTokens: trimmedToken,
      },
    });

    return res.status(200).json({
      message: 'Notification token saved successfully',
    });
  } catch (error) {
    console.error('Save owner FCM token failed:', error);

    return res.status(500).json({
      message: 'Unable to save notification token',
    });
  }
}

// PROTECTED TEST
async function protectedOwnerTest(req, res) {
  return res.status(200).json({
    message: 'Owner authentication successful',
    owner: {
      id: req.owner._id,
      shopId: req.owner.shopId,
      ownerName: req.owner.ownerName,
      shopName: req.owner.shopName,
      email: req.owner.email,
    },
  });
}

// GET OWNER PROFILE
async function getOwnerProfile(req, res) {
  try {
    const currentIsOpen = getShopStatus(req.owner);

    return res.status(200).json({
      owner: {
        id: req.owner._id,
        shopId: req.owner.shopId,
        ownerName: req.owner.ownerName,
        phone: req.owner.phone,
        email: req.owner.email,
        shopName: req.owner.shopName,
        description: req.owner.description,
        address: req.owner.address,
        location: req.owner.location,
        isOpen: currentIsOpen,
        delivery: req.owner.delivery,
        pickup: req.owner.pickup,
        categories: req.owner.categories,
        products: req.owner.products,
        payment: {
          provider: req.owner.payment?.provider,
          upiId: req.owner.payment?.upiId || '',
          rmaApprovalStatus: req.owner.payment?.rmaApprovalStatus,
        },
      },
    });
  } catch (error) {
    console.error('Get owner profile failed:', error.message);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}

const PASSWORD_RESET_GENERIC_MESSAGE =
  'If an owner account exists with that email, a password-reset link will be sent shortly.';

async function forgotOwnerPassword(req, res) {
  const email =
    typeof req.body.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';

  // Always return the same response to avoid revealing registered emails.
  if (!email || email.length > 254) {
    return res.status(200).json({
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  }

  try {
    const owner = await Owner.findOne({ email });

    if (!owner) {
      return res.status(200).json({
        message: PASSWORD_RESET_GENERIC_MESSAGE,
      });
    }

    // Limit reset-email requests for this owner to one per minute.
    const recentRequest = await OwnerPasswordReset.findOne({
      ownerId: owner._id,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    }).select('_id');

    if (recentRequest) {
      return res.status(200).json({
        message: PASSWORD_RESET_GENERIC_MESSAGE,
      });
    }

    // Invalidate previous unused reset links for this owner.
    await OwnerPasswordReset.deleteMany({
      ownerId: owner._id,
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    await OwnerPasswordReset.create({
      ownerId: owner._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not configured');
    }

    const resetUrl = `${frontendUrl}/owner/reset-password?token=${encodeURIComponent(rawToken)}`;

    await sendPasswordResetEmail(owner.email, resetUrl);

    return res.status(200).json({
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  } catch (error) {
    console.error('Owner password-reset request failed:', error.message);

    return res.status(200).json({
      message: PASSWORD_RESET_GENERIC_MESSAGE,
    });
  }
}

async function resetOwnerPassword(req, res) {
  const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
  const password =
    typeof req.body.password === 'string' ? req.body.password : '';

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({
      message: 'This password-reset link is invalid or has expired.',
    });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({
      message: 'Password must be between 8 and 128 characters.',
    });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Atomically claim the token so it cannot be used twice.
    const resetRecord = await OwnerPasswordReset.findOneAndUpdate(
      {
        tokenHash,
        expiresAt: { $gt: new Date() },
        usedAt: null,
      },
      {
        $set: { usedAt: new Date() },
      },
      { returnDocument: 'after' },
    );

    if (!resetRecord) {
      return res.status(400).json({
        message: 'This password-reset link is invalid or has expired.',
      });
    }

    const owner = await Owner.findById(resetRecord.ownerId);

    if (!owner) {
      return res.status(400).json({
        message: 'This password-reset link is invalid or has expired.',
      });
    }

    owner.password = await bcrypt.hash(password, 10);
    owner.authVersion = (owner.authVersion || 0) + 1;

    await owner.save();

    // Remove outstanding reset links for this owner.
    await OwnerPasswordReset.deleteMany({
      ownerId: owner._id,
    });

    return res.status(200).json({
      message: 'Your password has been reset successfully. Please log in.',
    });
  } catch (error) {
    console.error('Owner password reset failed:', error.message);

    return res.status(500).json({
      message: 'Unable to reset your password right now. Please try again.',
    });
  }
}

module.exports = {
  registerOwner,
  loginOwner,
  logoutOwner,
  saveOwnerNotificationToken,
  protectedOwnerTest,
  getOwnerProfile,
  forgotOwnerPassword,
  resetOwnerPassword,
};
