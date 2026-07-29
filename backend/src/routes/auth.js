const express = require('express');
const rateLimit = require('express-rate-limit');
const { adminAuth } = require('../middleware/adminAuth');
const {
  loginValidation,
  login,
  me,
  logout,
  forgotPassword,
  resetPasswordHandler,
} = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reset requests.' },
});

router.post('/login', loginLimiter, loginValidation, login);
router.post('/logout', logout);
router.get('/me', adminAuth, me);
router.post('/forgot-password', forgotLimiter, forgotPassword);
router.post('/reset-password', forgotLimiter, resetPasswordHandler);

module.exports = router;
