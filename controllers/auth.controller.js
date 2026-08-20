const asyncHabdler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');
const {registerUser, loginUser} = authService;
generateToken = require('../utils/generateToken');
// @desc    Register a new user
const register = asyncHabdler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    const user = await registerUser(fullName, username, email, password);
    const token = generateToken(user._id, user.username);
    res.status(201).json(new ApiResponse(201, { token }, 'User registered successfully'));
});

// @desc    Login a user
const login = asyncHabdler(async (req, res) => {
    const { identifier, password } = req.body;
    const user = await loginUser(identifier, password);
    const token = generateToken(user._id, user.username);
    res.status(200).json(new ApiResponse(200, { token }, 'User logged in successfully'));
});

const forgotPasswordHandler = asyncHabdler(async (req, res) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  res.status(200).json(new ApiResponse(200, null, 'A new password has been sent to your email'));
});
module.exports = {
    register,
    login,
    forgotPasswordHandler,
};