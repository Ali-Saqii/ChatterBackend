const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { createPost } = require('../services/post.service');

const create = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const file = req.file;

  const post = await createPost(req.user._id, { text, file });

  res.status(201).json(new ApiResponse(201, { post }, 'Post created successfully'));
});

module.exports = { create };