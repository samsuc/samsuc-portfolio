const express = require('express');
const rateLimit = require('express-rate-limit');
const { adminAuth } = require('../middleware/adminAuth');
const { track, summary } = require('../controllers/analyticsController');

const router = express.Router();

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many events' },
});

router.post('/track', trackLimiter, track);
router.get('/summary', adminAuth, summary);

module.exports = router;
