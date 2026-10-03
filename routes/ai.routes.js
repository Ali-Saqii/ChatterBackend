const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { generalRateLimiter } = require('../middleware/rateLimit.middleware');
const { chat } = require('../controllers/ai.controller');

router.post('/chat', protect, generalRateLimiter, chat);

module.exports = router;