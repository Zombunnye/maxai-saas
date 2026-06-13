const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chatController");

// ─── WHY: chatbotRoutes и chatRoutes правеха едно и също нещо.
// Сега chatbotRoutes сочи към СЪЩИЯ chatController.
// /api/chatbot/message е публичният endpoint за embed widget-а.
// tenantId идва от req.body в публичния случай.

router.post("/message", sendMessage);

module.exports = router;
