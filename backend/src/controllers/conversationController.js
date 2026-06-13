const Conversation = require("../models/Conversation");

/*
|--------------------------------------------------------------------------
| Get Conversations (за текущия tenant)
|--------------------------------------------------------------------------
*/

exports.getConversations = async (req, res) => {
  try {
    // ─── WHY: Филтрираме САМО по tenantId на логнатия потребител.
    // Всеки клиент вижда само своите разговори.
    const tenantId = req.user.tenantId;

    const conversations = await Conversation.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      total: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Save Conversation (manual — рядко се използва, chat endpoint го прави)
|--------------------------------------------------------------------------
*/

exports.saveConversation = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { visitorId, userMessage, aiReply } = req.body;

    const conversation = await Conversation.create({
      tenantId,
      visitorId,
      userMessage,
      aiReply,
    });

    res.json({ success: true, conversation });
  } catch (error) {
    console.error("saveConversation error:", error);
    res.status(500).json({ success: false, message: "Failed to save" });
  }
};
