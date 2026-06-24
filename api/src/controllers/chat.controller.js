const ChatService = require('../services/chat.service');
const R = require('../utils/response.utils');

const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || !message.trim()) return R.error(res, 'message is required', 400);
    const answer = await ChatService.chat(message.trim(), history);
    return R.success(res, { answer });
  } catch (err) { next(err); }
};

module.exports = { chat };
