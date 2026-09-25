const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');

const userRoom = (userId) => `user:${userId}`;

const serializeNotification = (notification) => (
  notification.toObject ? notification.toObject() : notification
);

const createNotification = async ({
  recipient,
  actor = null,
  type,
  entityType,
  entityId,
  message,
  metadata = {},
  io,
}) => {
  if (recipient.toString() === actor?.toString()) return null;

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    entityType,
    entityId,
    message,
    metadata,
  });
  await notification.populate('actor', 'fullName username avatarURL');

  if (io) {
    io.to(userRoom(recipient)).emit('notification:new', serializeNotification(notification));
  }

  return notification;
};

const notifyMessageRecipients = async ({ message, senderId, io }) => {
  const conversation = await Conversation.findById(message.conversation).select('participants');
  if (!conversation) return [];

  const recipients = conversation.participants.filter(
    (participant) => participant.toString() !== senderId.toString()
  );
  return Promise.all(recipients.map((recipient) => createNotification({
    recipient,
    actor: senderId,
    type: 'message',
    entityType: 'Message',
    entityId: message._id,
    message: 'sent you a new message',
    metadata: { conversationId: message.conversation },
    io,
  })));
};

const notifyFriendRequest = ({ recipient, actor, requestId, io }) => createNotification({
  recipient,
  actor,
  type: 'friend_request',
  entityType: 'FriendRequest',
  entityId: requestId,
  message: 'sent you a friend request',
  io,
});

const notifyFriendRequestAccepted = ({ recipient, actor, requestId, io }) => createNotification({
  recipient,
  actor,
  type: 'friend_request_accepted',
  entityType: 'FriendRequest',
  entityId: requestId,
  message: 'accepted your friend request',
  io,
});

const notifyPostActivity = ({ recipient, actor, type, entityType, entityId, io }) => createNotification({
  recipient,
  actor,
  type,
  entityType,
  entityId,
  message: type === 'like' ? 'liked your post' : 'commented on your post',
  io,
});

const getNotifications = async (userId, page = 1, limit = 20) => {
  const filter = { recipient: userId };
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'fullName username avatarURL')
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, readAt: null }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getUnreadCount = (userId) => Notification.countDocuments({
  recipient: userId,
  readAt: null,
});

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { readAt: new Date() } },
    { new: true }
  ).populate('actor', 'fullName username avatarURL');

  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return result.modifiedCount;
};

module.exports = {
  userRoom,
  createNotification,
  notifyMessageRecipients,
  notifyFriendRequest,
  notifyFriendRequestAccepted,
  notifyPostActivity,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
