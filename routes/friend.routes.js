const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/sendRequest/:receiverId', authMiddleware.protect, friendController.sendFriendRequest);
router.post('/acceptRequest/:requestId', authMiddleware.protect, friendController.acceptFriendRequest);
router.post('/cancelRequest/:requestId', authMiddleware.protect, friendController.cancelFriendRequest);
router.post('/declineRequest/:requestId', authMiddleware.protect, friendController.declineFriendRequest);
router.delete('/deleteFriend/:friendId', authMiddleware.protect, friendController.deleteFriend);
router.get('/allUsers', authMiddleware.protect, friendController.getAllUsers);
router.get('/searchPeople', authMiddleware.protect, friendController.searchPeople);
router.get('/searchFriends', authMiddleware.protect, friendController.searchFriends);
router.get('/searchFriendRequests', authMiddleware.protect, friendController.searchFriendRequests);
router.get('/friendsList', authMiddleware.protect, friendController.getFriendsList);
router.get('/friendRequests', authMiddleware.protect, friendController.getFriendRequests);
router.get('/sentRequests', authMiddleware.protect, friendController.getSentRequests);

module.exports = router;