const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

let io;

function initiliseSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id.toString()} connected (${socket.id})`);
    socket.join(`user:${socket.user._id.toString()}`);

    socket.on('joinConversation', async (conversationId, callback) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          return callback?.({
            success: false,
            message: 'Invalid conversation ID',
          });
        }

        const conversation = await Conversation.exists({
          _id: conversationId,
          participants: socket.user._id,
        });

        if (!conversation) {
          return callback?.({
            success: false,
            message: 'You are not a participant in this conversation',
          });
        }

        const room = `conversation:${conversationId}`;
        await socket.join(room);
        console.log(`User ${socket.user.username} joined conversation ${conversationId}`);

        return callback?.({
          success: true,
          room,
        });
      } catch (error) {
        console.error('Unable to join conversation:', error);
        return callback?.({
          success: false,
          message: 'Unable to join conversation',
        });
      }
    });

    socket.on('leaveConversation', async (conversationId, callback) => {
      try {
        const room = `conversation:${conversationId}`;
        await socket.leave(room);
        console.log(`User ${socket.user.username} left conversation ${conversationId}`);

        return callback?.({
          success: true,
          room,
        });
      } catch (error) {
        console.error('Unable to leave conversation:', error);
        return callback?.({
          success: false,
          message: 'Unable to leave conversation',
        });
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id.toString()}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
}

module.exports = { initiliseSocket, getIO };