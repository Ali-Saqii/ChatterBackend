const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

//Mark: Register User
const registerUser = async (fullName, username, email, password) => {
    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new ApiError(400, 'Username or email already exists');
    }
    
    const slt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, slt);

    const newUser = new User({
        fullName,
        username,
        email,
        passwordHash,
    });
    await newUser.save();
    return newUser
};

module.exports = {
    registerUser,
};

//Mark: Login User

const loginUser = async (identifier, password) => {
    // Find the user by username or email
      console.log('Received identifier:', identifier);
  console.log('Received password:', password);
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('+passwordHash');
    if (!user) {
        throw new ApiError(401, 'Invalid username/email or password');
    }
  console.log('User found:', user ? user.email : 'NO USER FOUND');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid username/email or password');
    }

    return user;
};

module.exports = {
    registerUser,
    loginUser,
};
