const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const conversationService = require('../services/conversation.service');
const ApiError = require('../utils/ApiError');

// Create a new conversation
const createConversation = asyncHandler(async (req, res) => {
  const { participantIds, isGroup, groupName } = req.body;
  if (!req.user || !req.user._id) {
    throw new ApiError(401, 'Authentication required');
  }
  const userId = req.user._id;

  const conversation = await conversationService.createConversation(
    userId,
    participantIds,
    isGroup,
    groupName
  );

  return res
    .status(201)
    .json(new ApiResponse(201, conversation, 'Conversation created successfully'));
});

// Get all conversations for a user

const getConversationsForUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page, limit } = req.query;

  const result = await conversationService.getConversationsForUser({
    userId,
    page,
    limit,
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Conversations retrieved successfully'));
});

const removeParticipant = asyncHandler(async (req, res) => {
  const conversation = await conversationService.removeParticipant(
    req.params.conversationId,
    req.user._id,
    req.params.userId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, conversation, 'Participant removed from group successfully'));
});

const leaveGroup = asyncHandler(async (req, res) => {
  await conversationService.leaveGroup(req.params.conversationId, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'You left the group successfully'));
});

module.exports = {
  createConversation,
  getConversationsForUser,
  removeParticipant,
  leaveGroup,
};
