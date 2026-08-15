const express = require('express');
const router = express.Router();

const {register,login } = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
module.exports = router;