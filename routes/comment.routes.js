const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { createCommentController, deleteCommentController, getCommentsByPostController } = require("../controllers/comment.controller");

router.post("/createComment/:postId", protect, createCommentController);
router.get("/getComments/:postId", protect, getCommentsByPostController);
router.delete("/deleteComment/:commentId", protect, deleteCommentController);

module.exports = router;