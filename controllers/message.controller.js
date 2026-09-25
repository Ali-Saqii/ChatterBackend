const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const messageService = require('../services/message.service');
const { conversationRoom } = require('../sockets/message.socket');
const { notifyMessageRecipients } = require('../services/notification.service');

const validateObjectId = (value, name) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${name} id`);
  }
};

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text, mediaUrl } = req.body;

  validateObjectId(conversationId, 'conversation');

  const message = await messageService.sendMessage({
    conversationId,
    senderId: req.user._id,
    text,
    mediaUrl,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(conversationRoom(conversationId)).emit('new_message', message.toObject());
    await notifyMessageRecipients({ message, senderId: req.user._id, io });
  }

  res.status(201).json(new ApiResponse(201, message, 'Message sent successfully'));
});

const getMessagesForConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 20 : Number(req.query.limit);

  validateObjectId(conversationId, 'conversation');
  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
    throw new ApiError(400, 'Page must be at least 1 and limit must be between 1 and 100');
  }

  const result = await messageService.getMessagesForConversation(
    conversationId,
    req.user._id,
    page,
    limit
  );

  res.status(200).json(new ApiResponse(200, result, 'Messages retrieved successfully'));
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  validateObjectId(messageId, 'message');

  const message = await messageService.markMessageAsRead({
    messageId,
    userId: req.user._id,
  });

  const io = req.app.get('io');
  if (io) {
    io.to(conversationRoom(message.conversation.toString())).emit('message_read', {
      messageId: message._id,
      userId: req.user._id,
    });
  }

  res.status(200).json(new ApiResponse(200, message, 'Message marked as read'));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  validateObjectId(messageId, 'message');
  await messageService.deleteMessage(messageId, req.user._id);

  res.status(200).json(new ApiResponse(200, null, 'Message deleted successfully'));
});

module.exports = {
  sendMessage,
  getMessagesForConversation,
  markMessageAsRead,
  deleteMessage,
};