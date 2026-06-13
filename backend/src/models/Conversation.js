const mongoose = require("mongoose");

// ─── WHY: Добавяме tenantId, за да може всеки бизнес клиент
// да вижда САМО своите разговори. Без това всички chatbot съобщения
// се смесват в една колекция и всеки може да чете чуждите данни.

const conversationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true, // индекс за бързо филтриране по tenant
    },

    visitorId: {
      type: String,
      required: true,
    },

    userMessage: {
      type: String,
      required: true,
    },

    aiReply: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // автоматично createdAt + updatedAt
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
