const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const {
  listMessages,
  getMessage,
  updateMsg,
  removeMsg,
  stats,
  dashboard,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', adminAuth, dashboard);
router.get('/stats', adminAuth, stats);
router.get('/messages', adminAuth, listMessages);
router.get('/messages/:id', adminAuth, getMessage);
router.patch('/messages/:id', adminAuth, updateMsg);
router.delete('/messages/:id', adminAuth, removeMsg);

module.exports = router;
