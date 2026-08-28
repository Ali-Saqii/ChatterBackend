const Post = require('../models/Post');
//const ApiError = require('../utils/ApiError');


// @ getfeed

const getFeed = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName username avatarURL'),
    Post.countDocuments({}),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};


module.exports = { getFeed };