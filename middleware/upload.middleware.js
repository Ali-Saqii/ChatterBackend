const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 0.5GB max (videos are bigger than avatars)
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (!isImage && !isVideo) {
      return cb(new Error('Only image or video files are allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;