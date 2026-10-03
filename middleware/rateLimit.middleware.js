const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const rateLimitHandler = (req, res, next) => {
  next(new ApiError(429, 'Too many requests, please try again later'));
};

const createLimiter = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
  });

const authRateLimiter = createLimiter(15 * 60 * 1000, 10);

const forgotPasswordRateLimiter = createLimiter(60 * 60 * 1000, 5);

const postRateLimiter = createLimiter(10 * 60 * 1000, 20);

const commentRateLimiter = createLimiter(10 * 60 * 1000, 20);

const engagementRateLimiter = createLimiter(10 * 60 * 1000, 100);

const generalRateLimiter = createLimiter(15 * 60 * 1000, 300);

module.exports = {
  authRateLimiter,
  forgotPasswordRateLimiter,
  postRateLimiter,
  commentRateLimiter,
  engagementRateLimiter,
  generalRateLimiter,
};