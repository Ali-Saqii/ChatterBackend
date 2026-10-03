const express = require('express');
const router = express.Router();

const {register,login,forgotPasswordHandler } = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('../validators/auth.validator');
const { authRateLimiter, forgotPasswordRateLimiter } = require('../middleware/rateLimit.middleware');

// Apply rate limiters to specific routes
router.post('/register', authRateLimiter, validateRequest(registerSchema), register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.post('/forgotPassword', forgotPasswordRateLimiter, validateRequest(forgotPasswordSchema), forgotPasswordHandler);
module.exports = router;