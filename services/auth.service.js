const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const { generateRandomPassword } = require('../utils/generateRandomPassword');
const transporter = require('../config/email');

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
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] }).select('+passwordHash');
    if (!user) {
        throw new ApiError(401, 'Invalid username/email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid username/email or password');
    }

    return user;
};



const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'No account found with this email');
  }

  const newPassword = generateRandomPassword();

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Your Chatter password has been reset',
    text: `Your new password is: ${newPassword}\n\nPlease log in and change it as soon as possible.`,
  });

  return true;
};
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
};
