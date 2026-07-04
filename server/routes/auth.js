const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { protect } = require('../middleware/auth');
const { sendTokenResponse } = require('../utils/jwt');
const { sendEmailOtp, sendSmsOtp } = require('../utils/otpService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// @route  POST /api/auth/send-otp
// @desc   Send OTP to email or phone
// @access Public
router.post(
  '/send-otp',
  [
    body('identifier').notEmpty().withMessage('Email or phone is required'),
    body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

      let { identifier, type, purpose = 'register' } = req.body;
      if (type === 'email') identifier = identifier.toLowerCase().trim();

      // Check if user already exists based on purpose
      const existingUser = await User.findOne(type === 'email' ? { email: identifier } : { phone: identifier });
      
      if (purpose === 'register' && existingUser) {
        return res.status(400).json({ success: false, message: `An account with this ${type} already exists.` });
      }
      
      if (purpose === 'forgot-password' && !existingUser) {
        return res.status(404).json({ success: false, message: `No account found with this ${type}.` });
      }

      // Generate cryptographically secure 6-digit OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();

      // Hash the OTP before storing — plain text OTPs in DB are a security risk
      const hashedOtp = await bcrypt.hash(otpCode, 10);

      // Save hashed OTP to DB (upsert if exists)
      await Otp.findOneAndUpdate(
        { identifier, type },
        { otp: hashedOtp, verified: false, createdAt: Date.now() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send OTP
      if (type === 'email') {
        await sendEmailOtp(identifier, otpCode);
      } else {
        await sendSmsOtp(identifier, otpCode);
      }

      res.json({ success: true, message: `OTP sent to your ${type}` });
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /api/auth/google
// @desc   Login or Register with Google
// @access Public
router.post('/google', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Google token is required' });

    // Verify access token by calling Google's userinfo endpoint
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    const payload = await response.json();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        googleId,
        role: 'student', // default
        photo: picture,
        isApproved: false
      });
      return res.status(201).json({ success: true, message: 'Account created. Please wait for admin approval.' });
    }

    // If local user logs in with Google, link accounts
    if (user.authProvider === 'local' && !user.googleId) {
      user.googleId = googleId;
      user.photo = user.photo || picture;
      await user.save();
    }

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    if (!user.isApproved) return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired Google Token' });
  }
});

// @route  POST /api/auth/verify-otp
// @desc   Verify OTP
// @access Public
router.post(
  '/verify-otp',
  [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

      let { identifier, otp, type } = req.body;
      if (type === 'email') identifier = identifier.toLowerCase().trim();

      const record = await Otp.findOne({ identifier, type });
      if (!record) {
        return res.status(400).json({ success: false, message: 'OTP expired or not sent' });
      }

      // Compare submitted OTP against the stored hash
      const isValid = await bcrypt.compare(otp, record.otp);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Mark as verified
      record.verified = true;
      await record.save();

      res.json({ success: true, message: `${type === 'email' ? 'Email' : 'Phone number'} verified successfully!` });
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /api/auth/reset-password-otp
// @desc   Reset password using OTP
// @access Public
router.post(
  '/reset-password-otp',
  [
    body('identifier').notEmpty().withMessage('Identifier is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('type').isIn(['email', 'phone']).withMessage('Type must be email or phone'),
    body('newPassword').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

      let { identifier, otp, type, newPassword } = req.body;
      if (type === 'email') identifier = identifier.toLowerCase().trim();

      const record = await Otp.findOne({ identifier, type });
      if (!record) {
        return res.status(400).json({ success: false, message: 'OTP expired or not sent' });
      }

      // Compare submitted OTP against the stored hash
      const isValid = await bcrypt.compare(otp, record.otp);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Find user
      const userQuery = type === 'email' ? { email: identifier } : { phone: identifier };
      const user = await User.findOne(userQuery);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Delete OTP record
      await Otp.deleteOne({ _id: record._id });

      res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /api/auth/register
// @desc   Register a new student or teacher (self-registration)
// @access Public
router.post(
  '/register',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email address (e.g. name@gmail.com)'),
    body('password').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role').isIn(['student', 'teacher']).withMessage('Role must be student or teacher'),
    body('class').if(body('role').equals('student')).notEmpty().withMessage('Class is required for students'),
    body('rollNumber').if(body('role').equals('student')).notEmpty().withMessage('Roll number is required for students'),
    body('subject').if(body('role').equals('teacher')).notEmpty().withMessage('Subject is required for teachers'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
      }

      const { name, password, role, class: userClass, rollNumber, subject, qualification, experience, phone } = req.body;
      const email = req.body.email.toLowerCase().trim();

      // Admins cannot self-register
      if (role === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin accounts cannot be created through registration.' });
      }

      // Verify Email OTP status
      const emailOtpRecord = await Otp.findOne({ identifier: email, type: 'email', verified: true });
      if (!emailOtpRecord) {
        return res.status(400).json({ success: false, message: 'Please verify your email address first.' });
      }

      // Verify Phone OTP status (if phone is provided)
      if (phone) {
        const phoneOtpRecord = await Otp.findOne({ identifier: phone, type: 'phone', verified: true });
        if (!phoneOtpRecord) {
          return res.status(400).json({ success: false, message: 'Please verify your phone number first.' });
        }
      }

      // Check if email already exists (just to be safe)
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Delete OTP records to clean up
      await Otp.deleteMany({ identifier: { $in: [email, phone].filter(Boolean) } });

      // Build user object based on role
      const userData = { name, email, password, role, phone: phone || '', isApproved: false };

      if (role === 'student') {
        userData.class = userClass;
        userData.rollNumber = rollNumber;
      }

      if (role === 'teacher') {
        userData.subject = subject;
        userData.qualification = qualification || '';
        userData.experience = experience || '';
      }

      const user = await User.create(userData);
      res.status(201).json({ success: true, message: 'Account created successfully. Please wait for admin approval before logging in.' });
    } catch (error) {
      next(error);
    }
  }
);

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { password } = req.body;
      const email = req.body.email.toLowerCase().trim();
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }
      if (user.role !== 'admin' && !user.isApproved) {
        return res.status(401).json({ success: false, message: 'Account is pending admin approval' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      sendTokenResponse(user, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

// @route  GET /api/auth/me
// @desc   Get current logged-in user
// @access Private
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route  POST /api/auth/logout
// @desc   Logout user / clear cookie
// @access Private
router.post('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'User logged out successfully' });
});

// @route  PUT /api/auth/change-password
// @desc   Change password
// @access Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/).withMessage('New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.matchPassword(req.body.currentPassword);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
