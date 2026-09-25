const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const messageService = require('../services/message.service');
const { notifyMessageRecipients, userRoom } = require('../services/notification.service');

const conversationRoom = (conversationId) => `conversation:${conversationId}`;

const isParticipant = (conversation, userId) => conversation.participants.some(
  (participant) => participant.toString() === userId.toString()
);

const getToken = (socket) => {
  const authToken = socket.handshake.auth && socket.handshake.auth.token;
  if (authToken) return authToken.replace(/^Bearer\s+/i, '').trim();

  const authorization = socket.handshake.headers.authorization;
  if (authorization && /^Bearer\s+\S+$/i.test(authorization)) {
    return authorization.replace(/^Bearer\s+/i, '').trim();
  }

  return null;
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = getToken(socket);
    if (!token) return next(new Error('Not authorized, no token'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Not authorized, user not found'));

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Not authorized, token failed'));
  }
};

const requireParticipant = async (conversationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation id');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error('Conversation not found');
  if (!isParticipant(conversation, userId)) {
    throw new Error('User is not a participant in this conversation');
  }

  return conversation;
};

const respond = (ack, result) => {
  if (typeof ack === 'function') ack(result);
};

const respondError = (socket, ack, event, error) => {
  const response = { success: false, message: error.message };
  socket.emit('message_error', { event, message: error.message });
  respond(ack, response);
};

const initializeMessageSocket = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.join(userRoom(socket.user._id));

    socket.on('join_conversation', async ({ conversationId } = {}, ack) => {
      try {
        await requireParticipant(conversationId, socket.user._id);
        await socket.join(conversationRoom(conversationId));
        respond(ack, { success: true, conversationId });
      } catch (error) {
        respondError(socket, ack, 'join_conversation', error);
      }
    });

    socket.on('leave_conversation', async ({ conversationId } = {}, ack) => {
      try {
        await requireParticipant(conversationId, socket.user._id);
        await socket.leave(conversationRoom(conversationId));
        respond(ack, { success: true, conversationId });
      } catch (error) {
        respondError(socket, ack, 'leave_conversation', error);
      }
    });

    socket.on('send_message', async ({ conversationId, text, mediaUrl } = {}, ack) => {
      try {
        await requireParticipant(conversationId, socket.user._id);
        const message = await messageService.sendMessage({
          conversationId,
          senderId: socket.user._id,
          text,
          mediaUrl,
        });
        const payload = message.toObject();
        io.to(conversationRoom(conversationId)).emit('new_message', payload);
        await notifyMessageRecipients({ message, senderId: socket.user._id, io });
        respond(ack, { success: true, message: payload });
      } catch (error) {
        respondError(socket, ack, 'send_message', error);
      }
    });

    socket.on('mark_message_read', async ({ messageId } = {}, ack) => {
      try {
        const message = await messageService.markMessageAsRead({
          messageId,
          userId: socket.user._id,
        });
        io.to(conversationRoom(message.conversation.toString())).emit('message_read', {
          messageId: message._id,
          userId: socket.user._id,
        });
        respond(ack, { success: true, message });
      } catch (error) {
        respondError(socket, ack, 'mark_message_read', error);
      }
    });

    socket.on('delete_message', async ({ messageId } = {}, ack) => {
      try {
        const message = await requireMessage(messageId, socket.user._id);
        await messageService.deleteMessage(messageId, socket.user._id);
        io.to(conversationRoom(message.conversation.toString())).emit('message_deleted', {
          messageId,
          conversationId: message.conversation,
        });
        respond(ack, { success: true, messageId });
      } catch (error) {
        respondError(socket, ack, 'delete_message', error);
      }
    });
  });

  return io;
};

const requireMessage = async (messageId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) throw new Error('Invalid message id');
  const message = await Message.findById(messageId);
  if (!message) throw new Error('Message not found');
  await requireParticipant(message.conversation, userId);
  return message;
};

module.exports = { initializeMessageSocket, conversationRoom };
