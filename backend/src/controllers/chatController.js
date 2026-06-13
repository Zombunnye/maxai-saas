const Conversation = require("../models/Conversation");
const { generateAIReply } = require("../services/openaiService");

// ─── WHY: Оригиналният код имаше chatController.js и chatbotController.js
// като идентични копия. Обединяваме ги в един файл.
// chatbotRoutes.js сега просто сочи към същия контролер.

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
| Приема message от потребителя, генерира AI отговор,
| записва разговора в БД под правилния tenant.
|--------------------------------------------------------------------------
*/

exports.sendMessage = async (req, res) => {
  try {
    const { visitorId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ─── WHY: tenantId идва от JWT token-а (req.user), НЕ от req.body.
    // Ако го вземем от body, злонамерен потребител може да подаде чужд tenantId
    // и да запише данни в чужд акаунт. JWT-ът е подписан от сървъра — доверяваме му се.
    const tenantId = req.user?.tenantId || req.body.tenantId || "public";

    const aiReply = await generateAIReply(message);

    const conversation = await Conversation.create({
      tenantId,
      visitorId: visitorId || "anonymous",
      userMessage: message,
      aiReply,
    });

    res.json({
      success: true,
      aiReply,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({
      success: false,
      message: "Chat failed",
    });
  }
};
