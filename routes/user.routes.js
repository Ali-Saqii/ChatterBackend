const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const controllers = require('../controllers/user.controller');
const upload = require('../middleware/upload.middleware')
// @route   DELETE /api/user/delete
router.delete('/delete', protect, controllers.deleteAccount);
// @route   
router.put('/updatePassword', protect, controllers.updatePassword);
// @upload pic
router.patch('/profilePicture', protect, upload.single('avatar'), controllers.changeProfilePicture);
// @route   PUT /api/user/updateProfile
router.put('/updateProfile', protect, controllers.updateProfile);
module.exports = router;