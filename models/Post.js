const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: '',
    },
    mediaURL: {
      type: String,
      default: '',
    },
    mediaPublicId: {
      type: String,
      default: '',
    },
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video'],
      default: 'none',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Post', postSchema);