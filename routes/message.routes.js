const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const messageController = require('../controllers/message.controller');

router.use(authMiddleware.protect);

router.post('/conversation/:conversationId', messageController.sendMessage);
router.get('/conversation/:conversationId', messageController.getMessagesForConversation);
router.patch('/:messageId/read', messageController.markMessageAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
