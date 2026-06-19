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
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return null;
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// Password strength validator: min 8 chars, letters + numbers + symbol
const passwordValidator = body('password')
  .isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .matches(/[a-zA-Z]/).withMessage('كلمة المرور يجب أن تحتوي على حروف')
  .matches(/[0-9]/).withMessage('كلمة المرور يجب أن تحتوي على أرقام')
  .matches(/[^a-zA-Z0-9]/).withMessage('كلمة المرور يجب أن تحتوي على علامة خاصة مثل @#$');

// ── Register ──────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('الاسم مطلوب'),
    body('email').isEmail().normalizeEmail().withMessage('بريد إلكتروني صحيح مطلوب'),
    passwordValidator,
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;
    try {
      const { name, email, password, phone } = req.body;
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل بالفعل' });
      }
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
    body('email').isEmail().normalizeEmail().withMessage('بريد إلكتروني صحيح مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
  ],
  async (req, res, next) => {
    const err = validate(req, res);
    if (err) return;
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غلط' });
      }
      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'الحساب موقوف' });
      }
      sendToken(user, 200, res);
    } catch (e) {
      next(e);
    }
  }
);

// ── Admin Login ───────────────────────────────────────────
router.post(
  '/admin-login',
  adminLimiter,
  async (req, res, next) => {
    try {
      const { email, password, adminKey } = req.body;
      if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ success: false, message: 'مفتاح المشرف غلط' });
      }
      const user = await User.findOne({ email, role: 'admin' }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'بيانات غير صحيحة' });
      }
      sendToken(user, 200, res);
    } catch (e) {
      next(e);
    }
  }
);

// ── Create Admin (one-time setup route, delete after use) ─
// POST /api/auth/setup-admin  body: { setupKey, name, email, password }
router.post('/setup-admin', async (req, res, next) => {
  try {
    const { setupKey, name, email, password } = req.body;
    // Must provide the admin secret key to create admin
    if (setupKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: 'غير مصرح' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      // If exists, promote to admin
      exists.role = 'admin';
      await exists.save();
      return res.json({ success: true, message: 'تم ترقية المستخدم لأدمين', user: exists });
    }
    // Create new admin user (bypass password strength for setup)
    const user = await User.create({ name, email, password, role: 'admin' });
    sendToken(user, 201, res);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
