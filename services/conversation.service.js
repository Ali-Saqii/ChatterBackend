const Conversation = require('../models/Conversation');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const createConversation = async (userId, participantIds, isGroup, groupName) => {
  const allParticipantIds = Array.from(
    new Set([userId.toString(), ...participantIds.map(String)])
  );

  if (allParticipantIds.length < 2) {
    throw new ApiError(400, 'A conversation must have at least 2 participants');
  }

  const existingUsers = await User.countDocuments({ _id: { $in: allParticipantIds } });
  if (existingUsers !== allParticipantIds.length) {
    throw new ApiError(404, 'One or more participants were not found');
  }

  if (isGroup) {
    if (!groupName || groupName.trim() === '') {
      throw new ApiError(400, 'Group name is required for group conversations');
    }

    return Conversation.create({
      participants: allParticipantIds,
      isGroup: true,
      groupName: groupName.trim(),
      groupAdmin: userId,
    });
  }

  if (allParticipantIds.length !== 2) {
    throw new ApiError(400, 'Direct conversations must have exactly 2 participants');
  }

  const directKey = [...allParticipantIds].sort().join(':');
  const existingConversation = await Conversation.findOne({ directKey });
  if (existingConversation) {
    return existingConversation;
  }

  try {
    return await Conversation.create({
      participants: [...allParticipantIds].sort(),
      isGroup: false,
      directKey,
    });
  } catch (error) {
    if (error.code === 11000) {
      return Conversation.findOne({ directKey });
    }
    throw error;
  }
};

    // Get all conversations for a user
    const getConversationsForUser = async ({userId, page = 1, limit = 20}) => {
        const skip = (page - 1) * limit;
        const conversations = await Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('participants', 'username email avatarURL')
            .populate('groupAdmin', 'username email avatarURL')
            .lean();
        const totalConversations = await Conversation.countDocuments({ participants: userId });

        return {
            conversations,
            pagination: {
                total: totalConversations,
                page,
                limit,
                totalPages: Math.ceil(totalConversations / limit),
            },
        };
    };

    module.exports = {
        createConversation,
        getConversationsForUser,
    };