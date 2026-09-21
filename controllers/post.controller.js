const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { createPost, deletePost,getUserPosts } = require('../services/post.service');
const { getFeed } = require('../services/feed.service');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

const getPagination = (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError(400, 'Page must be at least 1 and limit must be between 1 and 100');
  }
  return { page, limit };
};

const validateObjectId = (value, name) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `Invalid ${name} ID`);
  }
};

const create = asyncHandler(async (req, res) => {  
  const { text } = req.body;
  const file = req.file;

  const post = await createPost(req.user._id, { text, file });

  res.status(201).json(new ApiResponse(201, { post }, 'Post created successfully'));
});



// Get userPosts
const getPostsByUser = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);

  const result = await getUserPosts(req.params.userId, page, limit);

  res.status(200).json(new ApiResponse(200, result, 'User posts fetched successfully'));
});
// delete post
const deletepost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  validateObjectId(postId, 'post');
  await deletePost(req.user._id, postId);
  res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

// my post

const MyPosts = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  validateObjectId(req.params.userId, 'user');

  const result = await getUserPosts(req.user._id, page, limit);
  res.status(200).json(new ApiResponse(200, result, 'My posts fetched successfully'));
});
// feed 

const getfeed = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);

  const result = await getFeed(page, limit);
  res.status(200).json(new ApiResponse(200, result, 'Feed fetched successfully'));
})

module.exports = { create, deletepost, getPostsByUser, MyPosts,getfeed };