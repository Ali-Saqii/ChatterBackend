const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { createPost, deletePost,getUserPosts } = require('../services/post.service');
const { getFeed } = require('../services/feed.service');

const create = asyncHandler(async (req, res) => {  
  const { text } = req.body;
  const file = req.file;

  const post = await createPost(req.user._id, { text, file });

  res.status(201).json(new ApiResponse(201, { post }, 'Post created successfully'));
});



// Get userPosts
const getPostsByUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getUserPosts(req.params.userId, page, limit);

  res.status(200).json(new ApiResponse(200, result, 'User posts fetched successfully'));
});
// delete post
const deletepost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  await deletePost(req.user._id, postId);
  res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

// my post

const MyPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getUserPosts(req.user._id, page, limit);
  res.status(200).json(new ApiResponse(200, result, 'My posts fetched successfully'));
});
// feed 

const getfeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getFeed(page, limit);
  res.status(200).json(new ApiResponse(200, result, 'Feed fetched successfully'));
})

module.exports = { create, deletepost, getPostsByUser, MyPosts,getfeed };