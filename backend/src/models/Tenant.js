const mongoose = require("mongoose");

// ─── WHY: Добавяме botConfig — тук клиентът "обучава" своя бот.
// Тази информация се вгражда в system prompt-а на OpenAI при всяко съобщение.

const tenantSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },

    ownerEmail: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["free", "pro", "agency"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // ─── BOT TRAINING CONFIG ───
    botConfig: {
      // Какво прави бизнесът
      description: { type: String, default: "" },

      // Услуги и цени
      services: { type: String, default: "" },

      // Работно време
      workingHours: { type: String, default: "" },

      // Чести въпроси и отговори
      faq: { type: String, default: "" },

      // Тон на бота
      tone: {
        type: String,
        enum: ["professional", "friendly", "casual"],
        default: "friendly",
      },

      // Поздравително съобщение за widget-а
      greeting: { type: String, default: "Hi! How can I help you today?" },

      // Основен цвят на widget-а
      primaryColor: { type: String, default: "#7c3aed" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tenant", tenantSchema);
