const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Conversation = require("../models/Conversation");
const Lead = require("../models/Lead");
const Tenant = require("../models/Tenant");

// ─── WHY: Оригиналният dashboard връщаше само "Protected dashboard data".
// Сега връща реални статистики за текущия tenant — разговори, leads, план.

router.get("/overview", authMiddleware, async (req, res) => {
  try {
    const { tenantId } = req.user;

    // Паралелни заявки — по-бързо от последователни await-ове
    const [totalConversations, totalLeads, tenant] = await Promise.all([
      Conversation.countDocuments({ tenantId }),
      Lead.countDocuments({ tenantId }),
      Tenant.findById(tenantId),
    ]);

    // Conversations от последните 7 дни
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentConversations = await Conversation.countDocuments({
      tenantId,
      createdAt: { $gte: weekAgo },
    });

    res.json({
      success: true,
      stats: {
        totalConversations,
        totalLeads,
        recentConversations,
        plan: tenant?.plan || "free",
        businessName: tenant?.businessName || "My Business",
      },
    });
  } catch (error) {
    console.error("dashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
});

module.exports = router;
