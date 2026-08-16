const jwt = require("jsonwebtoken");
const User = require("../models/User");
const apiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
    }
    if (!token) {
        return next(new apiError("Not authorized, no token", 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       user = await User.findById(decoded.id).select("-password");
    } catch (error) {
        return next(new apiError("Not authorized, token failed", 401));
    }
    if (!user) {
        return next(new apiError("Not authorized, user not found", 401));
    }

    req.user = user;
    next();

});

module.exports = { protect };