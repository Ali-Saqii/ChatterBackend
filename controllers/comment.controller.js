const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
const Like = require('../models/Like');
const ApiResponse = require('../utils/ApiResponse');
const { createComment, deleteComment, getCommentsByPost } = require('../services/comments.service');
// @ create a new comment
const createCommentController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;
    const { content } = req.body;
    
    if (!postId || !content) {
        throw new ApiError(400, 'Post ID and content are required');
    }
    
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const createdComment = await createComment(userId, postId, content);
    res.status(201).json(new ApiResponse(201, createdComment, 'Comment created successfully'));
});

// @ delete a comment
const deleteCommentController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const commentId = req.params.commentId;

    const isDeleted = await deleteComment(commentId, userId);
    if (!isDeleted) {
        throw new ApiError(404, 'Comment not found');
    }
    
    res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});


// @ get comments for a post
const getCommentsByPostController = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError(400, 'Page must be at least 1 and limit must be between 1 and 100');
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const comments = await getCommentsByPost(postId, page, limit);
    res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});


// @ like a post
const likePostController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
        throw new ApiError(409, 'Post already liked');
    }
    const createdLike = await Like.create({ user: userId, post: postId });
    post.likesCount += 1;
    await post.save();
    res.status(201).json(new ApiResponse(201, createdLike, 'Post liked successfully'));
});

// @ unlike a post
const unlikePostController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const deletedLike = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!deletedLike) {
        throw new ApiError(404, 'Like not found');
    }
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    res.status(200).json(new ApiResponse(200, null, 'Post unliked successfully'));
});

module.exports = { createCommentController, deleteCommentController, getCommentsByPostController, likePostController, unlikePostController };