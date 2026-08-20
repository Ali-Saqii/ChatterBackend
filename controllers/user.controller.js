const mongoose = require('mongoose');
const apiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const userService = require('../services/user.service');





// @desc    Delete user account
const deleteAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    if (!userId) {
        return next(new apiError('User not found', 404));
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json(new apiResponse(200,'User account deleted successfully', null));
});

// @desc    Update user password

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    

    if (!userId) {
        return res.status(404).json(new apiResponse(404, 'User not found', null));
    }
    if (!oldPassword || !newPassword) {
        return res.status(400).json(new apiResponse(400, 'Old password and new password are required', null));
    }

    await userService.updatePassword(userId, { oldPassword, newPassword });
    res.status(200).json(new apiResponse(200, 'Password updated successfully', null));
});
// upload pic
const changeProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new apiResponse(400, null, 'No image file provided'));
  }

  const user = await userService.updateProfilePicture(req.user._id, req.file.buffer);

  res.status(200).json(
    new apiResponse(200, { avatarURL: user.avatarURL }, 'Profile picture updated successfully')
  );
});
// @desc    Update user profile info
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fullName, username, bio } = req.body;

  if (!userId) {
    throw new apiError(401,'User not found');
  }

  const updatedUser = await userService.updateProfile(userId, { fullName, username, bio });

  res.status(200).json(
    new apiResponse(200, updatedUser, 'Profile updated successfully', true)
  );
});

// @desc    Get user profile info
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new apiError(401,'User not found');
  }

  const userProfile = await userService.getUserProfile(userId);

  res.status(200).json(
    new apiResponse(200, userProfile, 'User profile retrieved successfully', true)
  );
});

module.exports = {
    deleteAccount,
    updatePassword,
    changeProfilePicture,
    updateProfile,
    getUserProfile,
};

