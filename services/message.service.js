const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ApiError = require('../utils/ApiError');

const isParticipant = (conversation, userId) => conversation.participants.some(
  participant => participant.toString() === userId.toString()
);

const sendMessage = async ({ conversationId, senderId, text, mediaUrl, mediaURL }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  if (!isParticipant(conversation, senderId)) {
    throw new ApiError(403, 'User is not a participant in this conversation');
  }

  const normalizedText = typeof text === 'string' ? text.trim() : text;
  const normalizedMediaUrl = mediaUrl || mediaURL || null;
  if (!normalizedText && !normalizedMediaUrl) {
    throw new ApiError(400, 'Message must have either text or mediaUrl');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text: normalizedText || null,
    mediaUrl: normalizedMediaUrl,
    readBy: [senderId],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return message;
};

const getMessagesForConversation = async (conversationId, userId, page = 1, limit = 20) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, 'Conversation not found');
  }
  if (!isParticipant(conversation, userId)) {
    throw new ApiError(403, 'User is not a participant in this conversation');
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender', 'username avatarUrl')
    .lean();

  return {
    messages,
    pagination: {
      page,
      limit,
      total: await Message.countDocuments({ conversation: conversationId }),
    },
  };
};

const markMessageAsRead = async ({ messageId, userId }) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  const conversation = await Conversation.findById(message.conversation);
  if (!conversation || !isParticipant(conversation, userId)) {
    throw new ApiError(403, 'User is not a participant in this conversation');
  }

  const alreadyRead = message.readBy.some((id) => id.toString() === userId.toString());
  if (!alreadyRead) {
    message.readBy.push(userId);
    await message.save();
  }

  return message;
};

const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this message');
  }

  const deletedMessage = await Message.findOneAndDelete({
    _id: messageId,
    sender: userId,
  });

  if (!deletedMessage) {
    throw new ApiError(404, 'Message not found');
  }

  const conversation = await Conversation.findOne({
    _id: deletedMessage.conversation,
    lastMessage: deletedMessage._id,
  });
  if (conversation) {
    const previousMessage = await Message.findOne({
      conversation: deletedMessage.conversation,
    }).sort({ createdAt: -1 });

    conversation.lastMessage = previousMessage ? previousMessage._id : null;
    await conversation.save();
  }

  return true;
};

module.exports = {
  sendMessage,
  getMessagesForConversation,
  markMessageAsRead,
  deleteMessage,
};
