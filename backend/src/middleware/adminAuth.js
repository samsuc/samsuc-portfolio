const { verifyToken } = require('../utils/tokens');
const { findById } = require('../services/userStore');

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  const user = findById(payload.sub);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  next();
}

module.exports = { adminAuth };
