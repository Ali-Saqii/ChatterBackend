const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { createCommentController, deleteCommentController, getCommentsByPostController,likePostController, unlikePostController } = require("../controllers/comment.controller");
const {
  commentRateLimiter,
  engagementRateLimiter,
} = require("../middleware/rateLimit.middleware");

router.post("/createComment/:postId", commentRateLimiter, protect, createCommentController);
router.get("/getComments/:postId", protect, getCommentsByPostController);
router.delete("/deleteComment/:commentId", protect, deleteCommentController);

// @like

router.post("/likePost/:postId", engagementRateLimiter, protect, likePostController);
router.post("/unlikePost/:postId", engagementRateLimiter, protect, unlikePostController);
module.exports = router;
