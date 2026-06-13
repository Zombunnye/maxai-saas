const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { saveLead, getLeads } = require("../controllers/leadController");

// ─── WHY: POST е публичен — embed widget-ът записва leads без login.
// Widget-ът изпраща tenantId в body-то.
// GET е защитен — само логнатият клиент вижда своите leads.

router.post("/", saveLead);
router.get("/", authMiddleware, getLeads);

module.exports = router;
