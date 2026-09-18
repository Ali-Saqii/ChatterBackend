const FriendRequest = require('../models/Friends');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getPaginatedAggregationResult = async (pipeline, page, limit) => {
    const [result] = await FriendRequest.aggregate([
        ...pipeline,
        {
            $facet: {
                results: [
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit }
                ],
                count: [{ $count: 'total' }]
            }
        }
    ]);
    const total = result.count[0]?.total || 0;

    return {
        results: result.results,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const searchFriends = async (userId, searchTerm, page = 1, limit = 10) => {
    const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return getPaginatedAggregationResult([
        {
            $match: {
                status: 'accepted',
                $or: [{ sender: userId }, { receiver: userId }]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderUser'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'receiver',
                foreignField: '_id',
                as: 'receiverUser'
            }
        },
        { $unwind: '$senderUser' },
        { $unwind: '$receiverUser' },
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { sender: { $ne: userId } },
                            {
                                $or: [
                                    { 'senderUser.fullName': searchRegex },
                                    { 'senderUser.username': searchRegex }
                                ]
                            }
                        ]
                    },
                    {
                        $and: [
                            { receiver: { $ne: userId } },
                            {
                                $or: [
                                    { 'receiverUser.fullName': searchRegex },
                                    { 'receiverUser.username': searchRegex }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                friend: {
                    $cond: [
                        { $eq: ['$sender', userId] },
                        {
                            _id: '$receiverUser._id',
                            fullName: '$receiverUser.fullName',
                            username: '$receiverUser.username',
                            avatarURL: '$receiverUser.avatarURL',
                            bio: '$receiverUser.bio',
                            friendsCount: '$receiverUser.friendsCount'
                        },
                        {
                            _id: '$senderUser._id',
                            fullName: '$senderUser.fullName',
                            username: '$senderUser.username',
                            avatarURL: '$senderUser.avatarURL',
                            bio: '$senderUser.bio',
                            friendsCount: '$senderUser.friendsCount'
                        }
                    ]
                }
            }
        }
    ], page, limit).then(({ results, pagination }) => ({ friends: results.map(({ friend }) => friend), pagination }));
};

const searchFriendRequests = async (userId, searchTerm, page = 1, limit = 10) => {
    const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return getPaginatedAggregationResult([
        {
            $match: {
                status: 'pending',
                $or: [{ sender: userId }, { receiver: userId }]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderUser'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'receiver',
                foreignField: '_id',
                as: 'receiverUser'
            }
        },
        { $unwind: '$senderUser' },
        { $unwind: '$receiverUser' },
        {
            $match: {
                $or: [
                    {
                        $and: [
                            { sender: { $ne: userId } },
                            {
                                $or: [
                                    { 'senderUser.fullName': searchRegex },
                                    { 'senderUser.username': searchRegex }
                                ]
                            }
                        ]
                    },
                    {
                        $and: [
                            { receiver: { $ne: userId } },
                            {
                                $or: [
                                    { 'receiverUser.fullName': searchRegex },
                                    { 'receiverUser.username': searchRegex }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                sender: {
                    _id: '$senderUser._id',
                    fullName: '$senderUser.fullName',
                    username: '$senderUser.username',
                    avatarURL: '$senderUser.avatarURL'
                },
                receiver: {
                    _id: '$receiverUser._id',
                    fullName: '$receiverUser.fullName',
                    username: '$receiverUser.username',
                    avatarURL: '$receiverUser.avatarURL'
                }
            }
        }
    ], page, limit).then(({ results, pagination }) => ({ requests: results, pagination }));
};

const getAllUsers = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const filter = { _id: { $ne: userId } };

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('fullName username avatarURL bio friendsCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter)
    ]);

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const searchPeople = async (userId, searchTerm, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = {
        _id: { $ne: userId },
        $or: [
            { fullName: searchRegex },
            { username: searchRegex }
        ]
    };

    const [people, total] = await Promise.all([
        User.find(filter)
            .select('fullName username avatarURL bio friendsCount')
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter)
    ]);

    return {
        people,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// MARK: send friend request
const sendFriendRequest = async (senderId, receiverId) => {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, 'You cannot send a friend request to yourself');
    }

    if (!sender || !receiver) {
        throw new ApiError(404, 'User not found');
    }

    const existingRequest = await FriendRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    });

    if (existingRequest) {
        throw new ApiError(400, 'Friend request already sent');
    }


    const friendRequest = new FriendRequest({
        sender: senderId,
        receiver: receiverId
    });

    return await friendRequest.save();
};

// MARK: accept friend request
const acceptFriendRequest = async (userId, requestId) => {
    const friendRequest = await FriendRequest.findOne({ _id: requestId, receiver: userId });
    if (!friendRequest) {
        throw new ApiError(404, 'Friend request not found');
    }
    if (friendRequest.status === 'accepted') {
        throw new ApiError(409, 'This request has already been accepted');
    }
    friendRequest.status = 'accepted';
    await friendRequest.save();
    await Promise.all([
        User.findByIdAndUpdate(friendRequest.sender, { $inc: { friendsCount: 1 } }),
        User.findByIdAndUpdate(friendRequest.receiver, { $inc: { friendsCount: 1 } }),
    ]);
};

// MARK: decline friend request
const declineFriendRequest = async (userId, requestId) => {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
        throw new ApiError(404, 'Friend request not found');
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to decline this request');
    }

    await friendRequest.deleteOne();
    return true;
};

// MARK: cancel friend request
const cancelFriendRequest = async (userId, requestId) => {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
        throw new ApiError(404, 'Friend request not found');
    }
    if (friendRequest.sender.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to cancel this request');
    }
    await friendRequest.deleteOne();
    return true;
}

// Mark: remove friend 
const removeFriendRequest = async (userId, requestId) => {
    const friendRequest = await FriendRequest.findOne({
        status: 'accepted',
        $or: [
            { sender: userId, receiver: requestId },
            { receiver: userId, sender: requestId }
        ]
    });
    if (!friendRequest) {
        throw new ApiError(404, 'Friend request not found');
    }
    await friendRequest.deleteOne();
    await User.updateMany(
        { _id: { $in: [userId, requestId] } },
        { $inc: { friendsCount: -1 } }
    );
    return true;
};

const getFriends = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [friends, total] = await Promise.all([
        FriendRequest.find({
            status: 'accepted',
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .populate('sender receiver', 'fullName username avatarURL')
            .skip(skip)
            .limit(limit),
        FriendRequest.countDocuments({
            status: 'accepted',
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
    ]);

    const results = friends.map(friend => {
        const otherUser = friend.sender._id.toString() === userId.toString()
            ? friend.receiver
            : friend.sender;
        return otherUser;
    });

    return {
        friends: results,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// Mark: Get all friend requests
const getFriendRequests = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [friendRequests, total] = await Promise.all([
        FriendRequest.find({
            status: 'pending',
            receiver: userId
        })
            .populate('sender', 'fullName username avatarURL')
            .skip(skip)
            .limit(limit),
        FriendRequest.countDocuments({
            status: 'pending',
            receiver: userId
        })
    ]);

    return {
        requests: friendRequests,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// MARK: Get all sent friend requests
const getSentFriendRequests = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [sentFriendRequests, total] = await Promise.all([
        FriendRequest.find({
            status: 'pending',
            sender: userId
        })
            .populate('receiver', 'fullName username avatarURL')
            .skip(skip)
            .limit(limit),
        FriendRequest.countDocuments({
            status: 'pending',
            sender: userId
        })
    ]);

    return {
        requests: sentFriendRequests,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = {
    searchFriends,
    searchFriendRequests,
    getAllUsers,
    searchPeople,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriendRequest,
    getFriends,
    cancelFriendRequest,
    getFriendRequests,
    getSentFriendRequests
};