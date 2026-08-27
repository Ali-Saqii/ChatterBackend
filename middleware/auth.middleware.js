const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
    }
    if (!token) {
        return next(new ApiError(401, "Not authorized, no token"));
    }
    let user;
    console.log('Token:', token);
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