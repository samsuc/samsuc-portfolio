const express = require('express');
const { contactLimiter } = require('../middleware/rateLimiter');
const { contactValidationRules, validate } = require('../middleware/validateContact');
const { handleContact } = require('../controllers/contactController');

const router = express.Router();

router.post(
  '/',
  contactLimiter,
  contactValidationRules,
  validate,
  handleContact
);

module.exports = router;
