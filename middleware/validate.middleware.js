const ApiError = require('../utils/ApiError');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            return next(new ApiError(400, 'Validation Error', errorMessages));
        }
        next();
    }
};

module.exports = validateRequest;