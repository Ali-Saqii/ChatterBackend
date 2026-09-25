const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

const getPagination = (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 20;
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ApiError(400, 'Page must be at least 1 and limit must be between 1 and 100');
  }
  return { page, limit };
};

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const result = await notificationService.getNotifications(req.user._id, page, limit);
  res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved successfully'));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(
    200,
    { unreadCount },
    'Unread notification count retrieved successfully'
  ));
});

const markAsRead = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.notificationId)) {
    throw new ApiError(400, 'Invalid notification id');
  }
  const notification = await notificationService.markAsRead(
    req.params.notificationId,
    req.user._id
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  const io = req.app.get('io');
  if (io) {
    io.to(notificationService.userRoom(req.user._id)).emit('notification:read', {
      notificationId: notification._id,
      readAt: notification.readAt,
    });
  }
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const updatedCount = await notificationService.markAllAsRead(req.user._id);
  const io = req.app.get('io');
  if (io) {
    io.to(notificationService.userRoom(req.user._id)).emit('notification:read_all');
  }
  res.status(200).json(new ApiResponse(
    200,
    { updatedCount },
    'Notifications marked as read'
  ));
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
