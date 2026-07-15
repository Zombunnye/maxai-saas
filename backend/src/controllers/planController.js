const Plan = require("../models/Plan");
const Tenant = require("../models/Tenant");

/*
|--------------------------------------------------------------------------
| GET /api/plans — ПУБЛИЧЕН — landing page и dashboard четат плановете
|--------------------------------------------------------------------------
*/

exports.getPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("getPublicPlans error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/admin/plans — ADMIN — всички планове (вкл. скрити)
|--------------------------------------------------------------------------
*/

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ sortOrder: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("getAllPlans error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch plans" });
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/admin/plans — създава нов план
|--------------------------------------------------------------------------
*/

exports.createPlan = async (req, res) => {
  try {
    const { key, name, description, prices, limits, sortOrder, isFeatured } = req.body;

    if (!key || !name) {
      return res.status(400).json({ success: false, message: "Key and name are required" });
    }

    const existing = await Plan.findOne({ key: key.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Plan with this key already exists" });
    }

    const plan = await Plan.create({
      key: key.toLowerCase(),
      name,
      description: description || "",
      prices: prices || {},
      limits: limits || {},
      sortOrder: sortOrder || 0,
      isFeatured: !!isFeatured,
    });

    res.status(201).json({ success: true, plan });
  } catch (error) {
    console.error("createPlan error:", error);
    res.status(500).json({ success: false, message: "Failed to create plan" });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/admin/plans/:id — редактира план (цени, лимити, всичко)
|--------------------------------------------------------------------------
*/

exports.updatePlan = async (req, res) => {
  try {
    const { name, description, prices, limits, sortOrder, isActive, isFeatured } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(prices !== undefined && { prices }),
          ...(limits !== undefined && { limits }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(isActive !== undefined && { isActive }),
          ...(isFeatured !== undefined && { isFeatured }),
        },
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, plan });
  } catch (error) {
    console.error("updatePlan error:", error);
    res.status(500).json({ success: false, message: "Failed to update plan" });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE /api/admin/plans/:id — трие план (ако никой не го ползва)
|--------------------------------------------------------------------------
*/

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    // ─── WHY: Не трием план, който активни клиенти използват —
    // това би счупило техните акаунти. Първо ги премести на друг план.
    const inUse = await Tenant.countDocuments({ plan: plan.key });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${inUse} business(es) are on this plan. Move them first.`,
      });
    }

    await plan.deleteOne();
    res.json({ success: true, message: "Plan deleted" });
  } catch (error) {
    console.error("deletePlan error:", error);
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
};

/*
|--------------------------------------------------------------------------
| PUT /api/admin/tenants/:id/plan — сменя плана на конкретен клиент
|--------------------------------------------------------------------------
*/

exports.changeTenantPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    // Проверяваме че планът съществува
    const planExists = await Plan.findOne({ key: plan });
    if (!planExists) {
      return res.status(400).json({ success: false, message: "Plan does not exist" });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { $set: { plan } },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    res.json({ success: true, message: `${tenant.businessName} moved to ${plan.toUpperCase()}`, tenant });
  } catch (error) {
    console.error("changeTenantPlan error:", error);
    res.status(500).json({ success: false, message: "Failed to change plan" });
  }
};
