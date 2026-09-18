const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const FriendRequest = require('../models/Friends');

const updatePassword = async (userId, { oldPassword, newPassword }) => {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, 'Current password is incorrect');
    }
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = newPasswordHash;
    await user.save();
    return user;
};

const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const posts = await Post.find({ author: userId }).select('mediaPublicId mediaType');
  const authoredComments = await Comment.find({ user: userId }).select('post');
  const acceptedFriendships = await FriendRequest.find({
    status: 'accepted',
    $or: [{ sender: userId }, { receiver: userId }],
  }).select('sender receiver');
  await Promise.all(
    posts
      .filter((post) => post.mediaPublicId)
      .map((post) => cloudinary.uploader.destroy(post.mediaPublicId, {
        resource_type: post.mediaType,
      }))
  );

  const postIds = posts.map((post) => post._id);
  const commentCounts = authoredComments.reduce((counts, comment) => {
    const postId = comment.post.toString();
    counts[postId] = (counts[postId] || 0) + 1;
    return counts;
  }, {});
  const otherFriendIds = acceptedFriendships.map((friendship) => (
    friendship.sender.toString() === userId.toString()
      ? friendship.receiver
      : friendship.sender
  ));
  await Promise.all([
    ...Object.entries(commentCounts).map(([postId, count]) => (
      Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -count } })
    )),
    ...otherFriendIds.map((friendId) => (
      User.findByIdAndUpdate(friendId, { $inc: { friendsCount: -1 } })
    )),
    Comment.deleteMany({ $or: [{ user: userId }, { post: { $in: postIds } }] }),
    Like.deleteMany({ $or: [{ user: userId }, { post: { $in: postIds } }] }),
    Post.deleteMany({ author: userId }),
    FriendRequest.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
  ]);

  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }
  await user.deleteOne();
};
// @ Clondinary upload
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'chatter/avatars' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// @ upload Profile pic 
const updateProfilePicture = async (userId, fileBuffer) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId);
  }

  const result = await uploadToCloudinary(fileBuffer);

  user.avatarURL = result.secure_url;
  user.avatarPublicId = result.public_id;
  await user.save();
  return user;
};

// update profile info
const updateProfile = async (userId, { fullName, username, bio }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
    if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new ApiError(400, 'Username is already taken');
        }
        user.username = username;
    }

  await user.save();
  return user;
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash -__v -createdAt -updatedAt -avatarPublicId');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};


const getUserByUsername = async (identifier) => {
  if (typeof identifier !== 'string' || !identifier.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  const normalizedIdentifier = identifier.trim();
  const escapedIdentifier = normalizedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const queryConditions = [
    { username: normalizedIdentifier },
    { username: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } }
  ];

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    queryConditions.push({ _id: normalizedIdentifier });
  }

  const user = await User.findOne({ $or: queryConditions })
    .select('-passwordHash -__v -createdAt -updatedAt -avatarPublicId');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = { 
    updatePassword ,
    deleteAccount,
    uploadToCloudinary,
    updateProfilePicture,
    updateProfile,
    getUserProfile,
    getUserByUsername,
};
