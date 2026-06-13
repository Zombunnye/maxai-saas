const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerClient);
router.post("/login", authController.login);
router.post("/register-client", authController.registerClient);

module.exports = router;