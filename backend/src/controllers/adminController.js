const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Lead = require("../models/Lead");

/*
|--------------------------------------------------------------------------
| GET /api/admin/tenants — списък с всички бизнеси + статистики
|--------------------------------------------------------------------------
*/

exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });

    // ─── WHY: За всеки tenant броим conversations и leads паралелно.
    // Promise.all върху map е много по-бързо от последователен for цикъл.
    const enriched = await Promise.all(
      tenants.map(async (t) => {
        const tenantId = t._id.toString();
        const [convCount, leadCount, owner] = await Promise.all([
          Conversation.countDocuments({ tenantId }),
          Lead.countDocuments({ tenantId }),
          User.findOne({ tenantId }).select("name email"),
        ]);

        return {
          id: t._id,
          businessName: t.businessName,
          ownerName: owner?.name || "—",
          ownerEmail: t.ownerEmail,
          plan: t.plan,
          status: t.status,
          conversations: convCount,
          leads: leadCount,
          createdAt: t.createdAt,
        };
      })
    );

    res.json({ success: true, total: enriched.length, tenants: enriched });
  } catch (error) {
    console.error("getAllTenants error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tenants" });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/admin/tenants/:id/conversations — разговорите на конкретен tenant
|--------------------------------------------------------------------------
*/

exports.getTenantConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ tenantId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, conversations });
  } catch (error) {
    console.error("getTenantConversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/admin/stats — глобални статистики за платформата
|--------------------------------------------------------------------------
*/

exports.getGlobalStats = async (req, res) => {
  try {
    const [totalTenants, totalConversations, totalLeads, totalUsers] = await Promise.all([
      Tenant.countDocuments(),
      Conversation.countDocuments(),
      Lead.countDocuments(),
      User.countDocuments(),
    ]);

    // Активност последните 7 дни
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentConversations = await Conversation.countDocuments({
      createdAt: { $gte: weekAgo },
    });

    res.json({
      success: true,
      stats: { totalTenants, totalConversations, totalLeads, totalUsers, recentConversations },
    });
  } catch (error) {
    console.error("getGlobalStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
