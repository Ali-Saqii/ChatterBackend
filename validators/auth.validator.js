const Joi = require('joi');

//Mark: Register Validation Schema
const registerSchema = Joi.object({ 
    fullName: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 3 characters long',
        'string.max': 'Full name must be at most 30 characters long',
    }),
    username: Joi.string().min(5).max(30).required().messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 5 characters long',
        'string.max': 'Username must be at most 30 characters long',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
    }),
});

//Mark: Login Validation Schema

const loginSchema = Joi.object({
    identifier: Joi.string().required().messages({
        'string.empty': 'Username or email is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
});
const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).max(72).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters',
    'string.max': 'New password must be under 72 characters',
  }),
});
const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(50).allow('').optional(),
  username: Joi.string().trim().alphanum().min(3).max(30).allow('').optional(),
  bio: Joi.string().max(160).allow('').optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    updateProfileSchema,
};