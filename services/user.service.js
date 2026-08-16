const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

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

module.exports = { updatePassword };