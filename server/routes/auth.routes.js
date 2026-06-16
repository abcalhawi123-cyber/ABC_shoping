const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { authLimiter, adminLimiter } = require('../middleware/security');

// ── Helpers ───────────────────────────────────────────────
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// ── Register ──────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;
    try {
      const { name, email, password, phone } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

      const user = await User.create({ name, email, password, phone });
      sendToken(user, 201, res);
    } catch (e) {
      next(e);
    }
  }
);

// ── Login ─────────────────────────────────────────────────
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      sendToken(user, 200, res);
    } catch (e) {
      next(e);
    }
  }
);

// ── Admin Login (requires adminKey + credentials) ─────────
router.post(
  '/admin-login',
  adminLimiter,
  async (req, res, next) => {
    try {
      const { email, password, adminKey } = req.body;
      if (adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ success: false, message: 'Invalid admin key' });
      }
      const user = await User.findOne({ email, role: 'admin' }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      sendToken(user, 200, res);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
