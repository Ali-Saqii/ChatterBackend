const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createPostSchema } = require('../validators/post.validator');
const { create, deletepost,getPostsByUser,MyPosts,getfeed } = require('../controllers/post.controller');
const { postRateLimiter } = require('../middleware/rateLimit.middleware');

router.post('/createPost', postRateLimiter, protect, upload.single('media'), validate(createPostSchema), create);
router.delete('/deletePost/:postId', protect, deletepost);
router.get('/userPosts/:userId', protect, getPostsByUser);
router.get('/myPosts', protect, MyPosts);
router.get('/feed', protect, getfeed);

module.exports = router;
