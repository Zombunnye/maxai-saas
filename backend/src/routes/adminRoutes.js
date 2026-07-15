const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllTenants,
  getTenantConversations,
  getGlobalStats,
} = require("../controllers/adminController");
const { changeTenantPlan } = require("../controllers/planController");

router.get("/tenants", adminMiddleware, getAllTenants);
router.get("/tenants/:id/conversations", adminMiddleware, getTenantConversations);
router.put("/tenants/:id/plan", adminMiddleware, changeTenantPlan);
router.get("/stats", adminMiddleware, getGlobalStats);

module.exports = router;
