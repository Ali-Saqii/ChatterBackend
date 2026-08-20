const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    bio: {
      type: String,
      default: '',
    },
    avatarURL: {
      type: String,
      default: '',
    },
    avatarPublicId: {
  type: String,
  default: '',
},
postsCount: {
  type: Number,
  default: 0,
},
friendsCount: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('User', userSchema);