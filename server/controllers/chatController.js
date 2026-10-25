const aiService = require('../services/aiService');

async function handleChatQuery(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a non-empty question in the "message" field.'
      });
    }

    const response = await aiService.processUserChat(message);

    res.json({
      success: true,
      query: message,
      reply: response.reply,
      provider: response.provider,
      verifiedDataOnly: true,
      recommendations: response.recommendations || []
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleChatQuery
};
