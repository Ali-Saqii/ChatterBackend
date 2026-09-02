const Comments = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const Post = require('../models/Post');
// @ create a new comment

const createComment = async (userId, postId, content) => {

    if (!content) {
        throw new ApiError(400, 'Content is required');
    };

    const comment = new Comments({
        post: postId,
        user: userId,
        content: content
    });

    await comment.save();

    // Increment the commentsCount in the Post model
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    return comment;

};

// @ delete a comment
const deleteComment = async (commentId, userId) => {
    const comment = await Comments.findById(commentId);
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    };

    if (comment.user.toString() !== userId) {
        throw new ApiError(403, 'You are not authorized to delete this comment');
    };

    // Decrement the commentsCount in the Post model
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    await Comments.findByIdAndDelete(commentId);
    return true;
};

// @ get comments for a post

const getCommentsByPost = async (postId,page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        Comments.find({ post: postId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'fullName username avatarURL'),
        Comments.countDocuments({ post: postId }),
    ]);

    return {
        comments,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

module.exports = { createComment, deleteComment, getCommentsByPost };