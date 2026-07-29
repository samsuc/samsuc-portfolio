const { body, validationResult } = require('express-validator');
const {
  findByEmail,
  verifyPassword,
  setResetToken,
  resetPassword,
  createUser,
} = require('../services/userStore');
const { signToken, createResetToken, hashToken } = require('../utils/tokens');
const { sendContactEmails } = require('../services/emailService');
const config = require('../config');

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }

  const { email, password } = req.body;
  const user = findByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const ok = await verifyPassword(user, password);
  if (!ok) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    expiresIn: config.jwtExpires,
  });
}

function me(req, res) {
  res.json({ success: true, user: req.user });
}

function logout(req, res) {
  // JWT is stateless — client discards token
  res.json({ success: true, message: 'Logged out' });
}

async function forgotPassword(req, res) {
  const email = (req.body.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  // Always return success to avoid email enumeration
  const user = findByEmail(email);
  if (user) {
    const raw = createResetToken();
    const hashed = hashToken(raw);
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    setResetToken(email, hashed, expires);

    // In production, send email with link containing `raw` token
    // For now log it (and try email if configured)
    console.log(`[auth] Password reset token for ${email}: ${raw}`);
    console.log(`[auth] Reset link example: /admin/reset.html?token=${raw}`);
  }

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  });
}

async function resetPasswordHandler(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Valid token and password (min 8 chars) required',
    });
  }

  const hashed = hashToken(token);
  const ok = await resetPassword(hashed, password);
  if (!ok) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  res.json({ success: true, message: 'Password updated. You can log in now.' });
}

module.exports = {
  loginValidation,
  login,
  me,
  logout,
  forgotPassword,
  resetPasswordHandler,
};
