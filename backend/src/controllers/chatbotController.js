const Conversation = require("../models/Conversation");
const { generateAIReply } = require("../services/openaiService");

exports.sendMessage = async (req, res) => {
  try {
    const { visitorId, message } = req.body;

    const aiReply = await generateAIReply(message);

    const conversation = await Conversation.create({
      visitorId,
      userMessage: message,
      aiReply,
    });

    res.json({
      success: true,
      userMessage: message,
      aiReply,
      conversation,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to process message",
    });
  }
};