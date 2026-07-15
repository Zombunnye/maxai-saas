const mongoose = require("mongoose");

// ─── WHY: Плановете живеят в БД, не в кода.
// Сменяш цена от Admin панела → отразява се навсякъде мигновено,
// без deploy. Всяка цена е в 3 валути (GBP основна за UK пазара).

const planSchema = new mongoose.Schema(
  {
    // Уникален ключ — използва се в Tenant.plan
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // "free", "pro", "agency"
    },

    name: {
      type: String,
      required: true, // "Starter", "Pro", "Agency"
    },

    description: {
      type: String,
      default: "",
    },

    // ─── ЦЕНИ В 3 ВАЛУТИ (на месец) ───
    prices: {
      gbp: { type: Number, default: 0 },
      eur: { type: Number, default: 0 },
      usd: { type: Number, default: 0 },
    },

    // ─── ЛИМИТИ ───
    limits: {
      chatbots: { type: Number, default: 1 },        // -1 = unlimited
      conversationsPerMonth: { type: Number, default: 100 }, // -1 = unlimited
      removeBranding: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
    },

    // Ред на показване + видимост
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }, // "Most popular" badge
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);
