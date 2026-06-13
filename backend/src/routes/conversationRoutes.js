const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getConversations, saveConversation } = require("../controllers/conversationController");

// ─── WHY: Разговорите са чувствителни данни на клиента —
// само логнат потребител с правилен tenantId може да ги чете.

router.get("/", authMiddleware, getConversations);
router.post("/", authMiddleware, saveConversation);

module.exports = router;
