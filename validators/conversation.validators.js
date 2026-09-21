const Joi = require('joi');

const createConversationSchema = Joi.object({
  participantIds: Joi.array()
    .items(Joi.string().hex().length(24)) // valid MongoDB ObjectId format
    .min(1)
    .required(),
  isGroup: Joi.boolean().default(false),
  groupName: Joi.string().trim().min(1).max(100).when('isGroup', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

module.exports = {
  createConversationSchema,
  paginationSchema,
};