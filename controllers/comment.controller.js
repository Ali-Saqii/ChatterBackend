const asyncHandler = require('../utils/asyncHandler');
const comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
const like = require('../models/Like');
const User = require('../models/User');
const apiResponse = require('../utils/ApiResponse');
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

    const comment = await createComment(userId, postId, content);
    return new apiResponse(201, comment, 'Comment created successfully');
});

// @ delete a comment
const deleteCommentController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const commentId = req.params.commentId;

    const isDeleted = await deleteComment(commentId, userId);
    if (!isDeleted) {
        throw new ApiError(404, 'Comment not found');
    }
    
    return new apiResponse(200, null, 'Comment deleted successfully');
});


// @ get comments for a post
const getCommentsByPostController = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const comments = await getCommentsByPost(postId, page, limit);
    return new apiResponse(200, comments, 'Comments fetched successfully');
});


// @ like a post
const likePostController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const like = await like.create({ user: userId, Post: postId });
    await like.save();
    post.likesCount += 1;
    await post.save();
    return new apiResponse(201, like, 'Post liked successfully');
});

// @ unlike a post
const unlikePostController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const like = await like.findOneAndDelete({ user: userId, Post: postId });
    if (!like) {
        throw new ApiError(404, 'Like not found');
    }
    post.likesCount -= 1;
    await post.save();
    return new apiResponse(200, null, 'Post unliked successfully');
});

module.exports = { createCommentController, deleteCommentController, getCommentsByPostController, likePostController, unlikePostController };