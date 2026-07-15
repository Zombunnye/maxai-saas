const Tenant = require("../models/Tenant");

/*
|--------------------------------------------------------------------------
| GET /api/tenant/config — текущата bot конфигурация
|--------------------------------------------------------------------------
*/

exports.getBotConfig = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    res.json({
      success: true,
      businessName: tenant.businessName,
      botConfig: tenant.botConfig || {},
    });
  } catch (error) {
    console.error("getBotConfig error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch config" });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/tenant/config — записва bot конфигурацията
|--------------------------------------------------------------------------
*/

exports.updateBotConfig = async (req, res) => {
  try {
    const { description, services, workingHours, faq, tone, greeting, primaryColor } = req.body;

    // ─── WHY: Обновяваме само botConfig полетата, не целия tenant.
    // $set с dot notation пази останалите полета непокътнати.
    const tenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      {
        $set: {
          "botConfig.description": description || "",
          "botConfig.services": services || "",
          "botConfig.workingHours": workingHours || "",
          "botConfig.faq": faq || "",
          "botConfig.tone": tone || "friendly",
          "botConfig.greeting": greeting || "Hi! How can I help you today?",
          "botConfig.primaryColor": primaryColor || "#7c3aed",
        },
      },
      { new: true }
    );

    res.json({ success: true, message: "Bot configuration saved", botConfig: tenant.botConfig });
  } catch (error) {
    console.error("updateBotConfig error:", error);
    res.status(500).json({ success: false, message: "Failed to save config" });
  }
};
