const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getPublicPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

// Публичен — landing page чете актуалните планове/цени от тук
router.get("/", getPublicPlans);

// Admin-only
router.get("/all", adminMiddleware, getAllPlans);
router.post("/", adminMiddleware, createPlan);
router.put("/:id", adminMiddleware, updatePlan);
router.delete("/:id", adminMiddleware, deletePlan);

module.exports = router;
