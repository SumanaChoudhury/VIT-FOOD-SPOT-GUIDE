const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { chatLimiter } = require('../middleware/rateLimiter');

// POST /api/chat
router.post('/', chatLimiter, chatController.handleChatQuery);

module.exports = router;
