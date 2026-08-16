const multer = require('multer');
const apiError = require('../utils/ApiError')
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new apiError('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;