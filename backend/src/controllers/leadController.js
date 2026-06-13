const Lead = require("../models/Lead");

/*
|--------------------------------------------------------------------------
| Save Lead
|--------------------------------------------------------------------------
*/

exports.saveLead = async (req, res) => {
  try {
    // ─── WHY: tenantId може да дойде от JWT (ако логнат потребител)
    // ИЛИ от req.body (ако embed widget-ът го праща публично).
    // Widget-ът трябва да включва tenantId в заявката си.
    const tenantId = req.user?.tenantId || req.body.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "tenantId required" });
    }

    const { name, email, phone, message, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email required" });
    }

    const lead = await Lead.create({
      tenantId,
      name,
      email,
      phone: phone || "",
      message: message || "",
      source: source || "website_chatbot",
    });

    res.status(201).json({ success: true, lead });
  } catch (error) {
    console.error("saveLead error:", error);
    res.status(500).json({ success: false, message: "Failed to save lead" });
  }
};

/*
|--------------------------------------------------------------------------
| Get Leads (само за текущия tenant)
|--------------------------------------------------------------------------
*/

exports.getLeads = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const leads = await Lead.find({ tenantId }).sort({ createdAt: -1 });

    res.json({ success: true, total: leads.length, leads });
  } catch (error) {
    console.error("getLeads error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
};
