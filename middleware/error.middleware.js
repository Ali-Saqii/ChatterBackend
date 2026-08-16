const ApiError = require('../utils/ApiError');

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Agar error ApiError instance nahi hai (jaise Mongoose ya koi aur library ka raw error),
  // to usay bhi same shape mein convert kar do taake response consistent rahe
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || []);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    // stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorMiddleware;