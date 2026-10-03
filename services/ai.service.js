const OpenAI = require('openai');
const ApiError = require('../utils/ApiError');

const sendChatMessage = async (message) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError(503, 'AI service is not configured');
  }

  try {
    const openAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly, helpful assistant inside the Chatter social media app. Keep responses concise and conversational.',
        },
        ...message,
      ],
    });
    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      throw new ApiError(502, 'AI service returned an empty response');
    }
    return reply;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(502, 'Error occurred while sending chat message');
  }
};

module.exports = {
  sendChatMessage,
};