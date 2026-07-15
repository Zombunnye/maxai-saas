const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getBotConfig, updateBotConfig } = require("../controllers/tenantController");

router.get("/config", authMiddleware, getBotConfig);
router.put("/config", authMiddleware, updateBotConfig);

module.exports = router;
