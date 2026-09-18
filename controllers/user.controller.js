const apiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');





// @desc    Delete user account
const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        throw new apiError(404, 'User not found');
    }
    await userService.deleteAccount(userId);
    res.status(200).json(new apiResponse(200, null, 'User account deleted successfully'));
});

// @desc    Update user password

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    

    if (!userId) {
        return res.status(404).json(new apiResponse(404, null, 'User not found'));
    }
    if (!oldPassword || !newPassword) {
        return res.status(400).json(new apiResponse(400, null, 'Old password and new password are required'));
    }

    await userService.updatePassword(userId, { oldPassword, newPassword });
    res.status(200).json(new apiResponse(200, null, 'Password updated successfully'));
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
    new apiResponse(200, updatedUser, 'Profile updated successfully')
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
    new apiResponse(200, userProfile, 'User profile retrieved successfully')
  );
});


// @desc    Get user profile by username or ID
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new apiError(400, 'Username is required');
  }

  const userProfile = await userService.getUserByUsername(username);

  res.status(200).json(
    new apiResponse(200, userProfile, 'User profile retrieved successfully')
  );
});

module.exports = {
    deleteAccount,
    updatePassword,
    changeProfilePicture,
    updateProfile,
    getUserProfile,
    getUserByUsername,
};
