const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { createCommentController, deleteCommentController, getCommentsByPostController,likePostController, unlikePostController } = require("../controllers/comment.controller");

router.post("/createComment/:postId", protect, createCommentController);
router.get("/getComments/:postId", protect, getCommentsByPostController);
router.delete("/deleteComment/:commentId", protect, deleteCommentController);

// @like

router.post("/likePost/:postId", protect, likePostController);
router.post("/unlikePost/:postId", protect, unlikePostController);
module.exports = router;