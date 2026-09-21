const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const ApiError = require('../utils/ApiError');
const { createConversationSchema, paginationSchema } = require('../validators/conversation.validators');

const validateObjectId = (value, name) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${name} id`);
  }
};

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

router.delete(
  '/:conversationId/leave',
  authMiddleware.protect,
  (req, res, next) => {
    try {
      validateObjectId(req.params.conversationId, 'conversation');
      next();
    } catch (error) {
      next(error);
    }
  },
  conversationController.leaveGroup
);

router.delete(
  '/:conversationId/participants/:userId',
  authMiddleware.protect,
  (req, res, next) => {
    try {
      validateObjectId(req.params.conversationId, 'conversation');
      validateObjectId(req.params.userId, 'user');
      next();
    } catch (error) {
      next(error);
    }
  },
  conversationController.removeParticipant
);

module.exports = router;