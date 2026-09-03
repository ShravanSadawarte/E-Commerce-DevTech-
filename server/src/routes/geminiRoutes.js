const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');
const { apiLimiter } = require('../middleware/rateLimiter');

// Public endpoint - no auth required for shopping assistant (rate limited)
router.get('/health', geminiController.healthCheck);
router.post('/chat', apiLimiter, geminiController.chatWithGemini);

module.exports = router;
