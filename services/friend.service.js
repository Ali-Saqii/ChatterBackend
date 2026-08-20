const FriendRequest = require('../models/Friends');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// MARK: send friend request
const sendFriendRequest = async (senderId, receiverId) => {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (senderId === receiverId) {
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
const acceptFriendRequest = async (requestId) => {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
        throw new ApiError(404, 'Friend request not found');
    }
    if (friendRequest.status === 'accepted') {
        throw new ApiError(409, 'This request has already been accepted');
    }
    friendRequest.status = 'accepted';
    await friendRequest.save();

    const sender = await User.findById(friendRequest.sender);
    const receiver = await User.findById(friendRequest.receiver);

    await User.findByIdAndUpdate(friendRequest.sender, { $inc: { friendsCount: 1 } });
    await User.findByIdAndUpdate(friendRequest.receiver, { $inc: { friendsCount: 1 } });

    await sender.save();
    await receiver.save();
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
    const user = await User.findByIdAndUpdate(userId, { $inc: { friendsCount: -1 } });
    const friend = await User.findByIdAndUpdate(requestId, { $inc: { friendsCount: -1 } });
    return true;
};

// Mark: Get all friends
const getFriends = async (userId) => {
    const friends = await FriendRequest.find({
        status: 'accepted',
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).populate('sender receiver', 'fullName username avatarURL');


    return friends.map(friend => {
        if (friend.sender._id.toString() === userId.toString()) {
            friend.friend = friend.receiver;
        } else {
            friend.friend = friend.sender;
        }
    });

};

// Mark: Get all friend requests
const getFriendRequests = async (userId) => {
    const friendRequests = await FriendRequest.find({
        status: 'pending',
        receiver: userId
    }).populate('sender', 'fullName username avatarURL');
    return friendRequests;
};
// MARK: Get all sent friend requests
const getSentFriendRequests = async (userId) => {
    const sentFriendRequests = await FriendRequest.find({
        status: 'pending',
        sender: userId
    }).populate('receiver', 'fullName username avatarURL');
    return sentFriendRequests;
}

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriendRequest,
    getFriends,
    cancelFriendRequest,
    getFriendRequests,
    getSentFriendRequests
};