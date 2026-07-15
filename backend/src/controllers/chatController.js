const Conversation = require("../models/Conversation");
const Tenant = require("../models/Tenant");
const { generateAIReply } = require("../services/openaiService");

// ─── WHY: Това е сърцето на "обучението" на бота.
// Взимаме botConfig на конкретния tenant и строим персонализиран
// system prompt — ботът знае какво предлага бизнесът, цените,
// работното време и отговаря в правилния тон.

function buildSystemPrompt(tenant) {
  const cfg = tenant?.botConfig || {};
  const name = tenant?.businessName || "this business";

  const toneMap = {
    professional: "Maintain a professional, polished tone.",
    friendly: "Be warm, friendly and approachable.",
    casual: "Keep it casual and relaxed, like chatting with a friend.",
  };

  let prompt = `You are the AI assistant for "${name}". `;
  prompt += `Today's date is ${new Date().toLocaleDateString("en-GB")}. `;
  prompt += toneMap[cfg.tone] || toneMap.friendly;
  prompt += "\n\n";

  if (cfg.description) prompt += `ABOUT THE BUSINESS:\n${cfg.description}\n\n`;
  if (cfg.services) prompt += `SERVICES & PRICES:\n${cfg.services}\n\n`;
  if (cfg.workingHours) prompt += `WORKING HOURS:\n${cfg.workingHours}\n\n`;
  if (cfg.faq) prompt += `FREQUENTLY ASKED QUESTIONS:\n${cfg.faq}\n\n`;

  prompt += `RULES:
- Only answer questions related to this business. If asked something unrelated, politely redirect.
- If the visitor shows buying interest, encourage them to leave their contact details.
- If you don't know something, say you'll pass the question to the team — never invent facts.
- Keep answers concise (2-4 sentences unless more detail is needed).`;

  return prompt;
}

/*
|--------------------------------------------------------------------------
| POST /api/chatbot/message (публичен) и /api/chat/message (protected)
|--------------------------------------------------------------------------
*/

exports.sendMessage = async (req, res) => {
  try {
    const { visitorId, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const tenantId = req.user?.tenantId || req.body.tenantId || "public";

    // ─── WHY: Зареждаме tenant-а за да вземем неговия botConfig.
    // Ако няма (напр. demo) — ботът работи с общ промпт.
    let tenant = null;
    if (tenantId !== "public") {
      tenant = await Tenant.findById(tenantId).catch(() => null);
    }

    const systemPrompt = buildSystemPrompt(tenant);
    const aiReply = await generateAIReply(message, systemPrompt);

    const conversation = await Conversation.create({
      tenantId,
      visitorId: visitorId || "anonymous",
      userMessage: message,
      aiReply,
    });

    res.json({ success: true, aiReply, conversationId: conversation._id });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
};
