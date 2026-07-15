const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAllTenants,
  getTenantConversations,
  getGlobalStats,
} = require("../controllers/adminController");

// ─── WHY: ВСИЧКИ admin routes минават през adminMiddleware.
// Само потребител с role === "admin" в JWT-то може да ги достъпи.

router.get("/tenants", adminMiddleware, getAllTenants);
router.get("/tenants/:id/conversations", adminMiddleware, getTenantConversations);
router.get("/stats", adminMiddleware, getGlobalStats);

module.exports = router;
