const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const { createConversationSchema, paginationSchema } = require('../validators/conversation.validators');

// Get all conversations for a user
const getConversations = [
  authMiddleware.protect,
  validateRequest(paginationSchema, 'query'),
  conversationController.getConversationsForUser,
];

router.get('/', ...getConversations);
router.get('/user', ...getConversations);

// Create a new conversation
router.post(
  '/create',
  authMiddleware.protect,
  validateRequest(createConversationSchema),
  conversationController.createConversation
);

module.exports = router;