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

// A post must have EITHER text OR media (or both) — never completely empty
postSchema.pre('validate', function (next) {
  if (!this.text && this.mediaType === 'none') {
    return next(new Error('A post must contain either text or media'));
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);