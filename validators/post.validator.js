const Joi = require('joi');

const createPostSchema = Joi.object({
  text: Joi.string().trim().max(2000).allow('').optional().messages({
    'string.max': 'Post text must be under 2000 characters',
  }),
  media: Joi.any().optional(),
});

module.exports = { createPostSchema };