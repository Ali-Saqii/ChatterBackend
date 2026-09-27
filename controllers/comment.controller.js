const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
const Like = require('../models/Like');
const ApiResponse = require('../utils/ApiResponse');
const { createComment, deleteComment, getCommentsByPost } = require('../services/comments.service');
const mongoose = require('mongoose');
const { notifyPostActivity } = require('../services/notification.service');

const validateObjectId = (value, name) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, `Invalid ${name} ID`);
    }
};
// @ create a new comment
const createCommentController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;
    const { content } = req.body;
    
    if (!postId || !content) {
        throw new ApiError(400, 'Post ID and content are required');
    }
    validateObjectId(postId, 'post');
    
    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    const createdComment = await createComment(userId, postId, content);
    await notifyPostActivity({
        recipient: post.author,
        actor: userId,
        type: 'comment',
        entityType: 'Comment',
        entityId: createdComment._id,
    });
    res.status(201).json(new ApiResponse(201, createdComment, 'Comment created successfully'));
});

// @ delete a comment
const deleteCommentController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const commentId = req.params.commentId;
    validateObjectId(commentId, 'comment');

    const isDeleted = await deleteComment(commentId, userId);
    if (!isDeleted) {
        throw new ApiError(404, 'Comment not found');
    }
    
    res.status(200).json(new ApiResponse(200, null, 'Comment deleted successfully'));
});


// @ get comments for a post
const getCommentsByPostController = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    validateObjectId(postId, 'post');
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
    validateObjectId(postId, 'post');

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    let createdLike;
    try {
        createdLike = await Like.create({ user: userId, post: postId });
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, 'Post already liked');
        }
        throw error;
    }
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
    await notifyPostActivity({
        recipient: post.author,
        actor: userId,
        type: 'like',
        entityType: 'Post',
        entityId: postId,
    });
    res.status(201).json(new ApiResponse(201, createdLike, 'Post liked successfully'));
});

// @ unlike a post
const unlikePostController = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const postId = req.params.postId;
    validateObjectId(postId, 'post');

    const deletedLike = await Like.findOneAndDelete({ user: userId, post: postId });
    if (!deletedLike) {
        throw new ApiError(404, 'Like not found');
    }
    await Post.findOneAndUpdate(
        { _id: postId, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } }
    );
    res.status(200).json(new ApiResponse(200, null, 'Post unliked successfully'));
});

module.exports = { createCommentController, deleteCommentController, getCommentsByPostController, likePostController, unlikePostController };