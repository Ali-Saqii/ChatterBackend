const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && /^Bearer\s+\S+$/i.test(authHeader)) {
        token = authHeader.replace(/^Bearer\s+/i, '').trim();
    }
    if (!token) {
        return next(new ApiError(401, "Not authorized, no token"));
    }
    let user;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select("-password");
    } catch (error) {
        return next(new ApiError(401, "Not authorized, token failed"));
    }
    if (!user) {
        return next(new ApiError(401, "Not authorized, user not found"));
    }

    req.user = user;
    next();
});


module.exports = { protect };