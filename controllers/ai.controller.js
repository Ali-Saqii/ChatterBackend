const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const { sendChatMessage } = require("../services/ai.service");


const chat  = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !Array.isArray(message) || message.length === 0) {
    return res.status(400).json(new ApiResponse(400, null, "Message is required"));
  }

  const reply = await sendChatMessage(message);
  res.status(200).json(new ApiResponse(200, { reply }, "Message sent successfully"));
});

module.exports = {
  chat,
};