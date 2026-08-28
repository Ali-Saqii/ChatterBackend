const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createPostSchema } = require('../validators/post.validator');
const { create, deletepost,getPostsByUser } = require('../controllers/post.controller');

router.post('/createPost', protect, upload.single('media'),validate(createPostSchema), create);
router.delete('/deletePost/:postId', protect, deletepost);
router.get('/userPosts/:userId', protect, getPostsByUser);

module.exports = router;