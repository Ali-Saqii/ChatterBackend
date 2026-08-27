const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { createPost } = require('../services/post.service');

const create = asyncHandler(async (req, res) => {  
  const { text } = req.body;
  const file = req.file;

  const post = await createPost(req.user._id, { text, file });

  res.status(201).json(new ApiResponse(201, { post }, 'Post created successfully'));
});

// delete post
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  await deletePost(req.user._id, postId);
  res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});
module.exports = { create, deletePost };