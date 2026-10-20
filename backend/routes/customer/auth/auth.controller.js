const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('../../../models/Customer');
const LoginAttempt = require('../../../models/LoginAttempt');

// ===============================
// CUSTOMER LOGIN LOCKOUT
// ===============================
const LOGIN_MAX_ATTEMPTS = 3;
const LOGIN_LOCK_MS = 30 * 1000;
const LOGIN_RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function getCustomerLoginAttemptKey(email, ip) {
  const normalizedEmail =
    typeof email === 'string' ? email.trim().toLowerCase() : '';

  return `customer:${normalizedEmail}:${ip}`;
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

      // Another request may have created the record simultaneously.
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

// ===============================
// CUSTOMER REGISTER
// ===============================
const registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: 'Name, phone, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingCustomer = await Customer.findOne({
      $or: [{ phone: normalizedPhone }, { email: normalizedEmail }],
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: 'An account with this phone or email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Customer account created successfully',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Customer registration error:', error);

    return res.status(500).json({
      message: 'Unable to create customer account',
    });
  }
};

// ===============================
// CUSTOMER LOGIN
// ===============================
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const attemptKey = getCustomerLoginAttemptKey(normalizedEmail, ip);

    const existingAttempt = await getLoginAttemptRecord(attemptKey);
    const now = Date.now();

    // Reject attempts while the customer email/IP combination is locked.
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

    // Expired lockout: start a fresh attempt cycle.
    if (
      existingAttempt?.lockedUntil &&
      existingAttempt.lockedUntil.getTime() <= now
    ) {
      await LoginAttempt.deleteOne({ key: attemptKey });
    }

    const customer = await Customer.findOne({
      email: normalizedEmail,
    });

    const passwordMatch =
      customer?.isActive &&
      (await bcrypt.compare(password, customer.passwordHash));

    // Use a generic response for nonexistent, inactive, or invalid accounts.
    if (!customer || !customer.isActive || !passwordMatch) {
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
        message: 'Invalid email or password',
        remainingAttempts: Math.max(
          0,
          LOGIN_MAX_ATTEMPTS - attempt.failedAttempts,
        ),
      });
    }

    // Correct credentials: clear previous failed attempts.
    await clearFailedLogins(attemptKey);

    const token = jwt.sign(
      {
        customerId: customer._id,
      },
      process.env.CUSTOMER_JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );

    customer.lastLoginAt = new Date();
    await customer.save();

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error('Customer login error:', error);

    return res.status(500).json({
      message: 'Unable to login',
    });
  }
};

// ===============================
// CUSTOMER ME
// ===============================
const getCurrentCustomer = async (req, res) => {
  try {
    const token = req.cookies?.customer_token;

    if (!token) {
      return res.status(401).json({
        message: 'Customer authentication required',
      });
    }

    const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);

    const customer = await Customer.findById(decoded.customerId).select(
      '-passwordHash',
    );

    if (!customer) {
      return res.status(401).json({
        message: 'Customer account not found',
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        message: 'Customer account is inactive',
      });
    }

    return res.status(200).json({
      customer,
    });
  } catch (error) {
    console.error('Customer authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired customer session',
    });
  }
};

// ===============================
// CUSTOMER LOGOUT
// ===============================
const logoutCustomer = (req, res) => {
  res.clearCookie('customer_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({
    message: 'Logout successful',
  });
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  logoutCustomer,
};
