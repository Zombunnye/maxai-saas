const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendMessage } = require("../controllers/chatController");

// ─── WHY: /api/chat/message е защитеният endpoint за логнати потребители.
// authMiddleware декодира JWT и слага req.user (с tenantId) на заявката.

router.post("/message", authMiddleware, sendMessage);

module.exports = router;
