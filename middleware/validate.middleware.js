const ApiError = require('../utils/ApiError');

const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            return next(new ApiError(400, 'Validation Error', errorMessages));
        }
        req[source] = value; // validated + defaulted values wapas assign karte hain
        next();
    }
};

module.exports = validateRequest;