const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const controllers = require('../controllers/user.controller');

// @route   DELETE /api/user/delete
router.delete('/delete', protect, controllers.deleteAccount);
// @route   
router.put('/updatePassword', protect, controllers.updatePassword);
module.exports = router;