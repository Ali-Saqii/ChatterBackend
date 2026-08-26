const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const uploadMediaToCloudinary = (fileBuffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'chatter/posts', resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};


// Create a new post
const createPost = async (authorId, { text, file }) => {

    if (!text && !file) {
        throw new ApiError(400, 'Post must contain text or media');
    }

let mediaURL = '';
  let mediaPublicId = '';
  let mediaType = 'none';

    if (file) {
        const isVideo = file.mimetype.startsWith('video/');
        mediaType = isVideo ? 'video' : 'image';
        const result = await uploadMediaToCloudinary(file.buffer, mediaType);
        mediaURL = result.secure_url;
        mediaPublicId = result.public_id;
    }
  const post = await Post.create({
    author: authorId,
    text: text || '',
    mediaURL,
    mediaPublicId,
    mediaType,
  });

    return await post.save();
}

module.exports = {
    createPost
};