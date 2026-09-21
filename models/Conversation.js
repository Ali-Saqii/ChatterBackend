const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
      default: null,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    directKey: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Speeds up "find all conversations for this user" queries
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
