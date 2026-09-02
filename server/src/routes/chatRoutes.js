const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/conversation', chatController.getOrCreateConversation);
router.post('/messages', chatController.sendMessage);

module.exports = router;
