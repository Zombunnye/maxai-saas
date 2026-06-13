const mongoose = require("mongoose");

// ─── WHY: Същата причина като Conversation — всеки lead трябва
// да принадлежи на конкретен tenant (бизнес клиент).

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "website_chatbot",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
