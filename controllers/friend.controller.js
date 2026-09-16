const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const friendService = require('../services/friend.service');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

const getPagination = (query) => {
    const page = Number.parseInt(query.page, 10) || 1;
    const limit = Number.parseInt(query.limit, 10) || 10;
    if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError(400, 'Page must be at least 1 and limit must be between 1 and 100');
    }
    return { page, limit };
};

const sendFriendRequest = asyncHandler(async (req, res) => {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    await friendService.sendFriendRequest(senderId, receiverId);

    res.status(201).json(new ApiResponse(201, null, 'Friend request sent successfully'));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const requestId = req.params.requestId;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, 'Invalid request ID');
    }

     await friendService.acceptFriendRequest(req.user._id, requestId);

    res.status(200).json(new ApiResponse(200, null, 'Friend request accepted successfully'));
});

const declineFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const requestId = req.params.requestId;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, 'Invalid user ID or request ID');
    }

     await friendService.declineFriendRequest(userId, requestId);

    res.status(200).json(new ApiResponse(200, null, 'Friend request declined successfully'));
});

const deleteFriend = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const friendId = req.params.friendId;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
        throw new ApiError(400, 'Invalid user ID or friend ID');
    }

     await friendService.removeFriendRequest(userId, friendId);

    res.status(200).json(new ApiResponse(200, null, 'Friend deleted successfully'));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const requestId = req.params.requestId;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError(400, 'Invalid user ID or request ID');
    }
    await friendService.cancelFriendRequest(userId, requestId);

    res.status(200).json(new ApiResponse(200, null, 'Friend request cancelled successfully'));
});

const getFriendsList = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page, limit } = getPagination(req.query);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const friends = await friendService.getFriends(userId, page, limit);

    res.status(200).json(new ApiResponse(200, friends, 'Friends list retrieved successfully'));
});
const getFriendRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page, limit } = getPagination(req.query);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const friendRequests = await friendService.getFriendRequests(userId, page, limit);

    res.status(200).json(new ApiResponse(200, friendRequests, 'Friend requests retrieved successfully'));
});
const getSentRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page, limit } = getPagination(req.query);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const sentRequests = await friendService.getSentFriendRequests(userId, page, limit);

    res.status(200).json(new ApiResponse(200, sentRequests, 'Sent friend requests retrieved successfully'));
});

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    deleteFriend,
    getFriendsList,
    getFriendRequests,
    getSentRequests,
    cancelFriendRequest
};
