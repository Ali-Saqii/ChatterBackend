const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');

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
// @ Clondinary upload
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'chatter/avatars' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
        console.log(result)
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
module.exports = { 
    updatePassword ,
    uploadToCloudinary,
    updateProfilePicture,
};