const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// ─── WHY: requires трябва да са ВИНАГИ най-горе.
// Оригиналният код имаше User и Tenant require-нати СЛЕД функциите,
// което означава login() щеше да гръмне с "User is not defined".

/*
|--------------------------------------------------------------------------
| Register Client (създава Tenant + User в една заявка)
|--------------------------------------------------------------------------
*/

exports.registerClient = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and business name are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Създаваме Tenant първо — всеки клиент е отделен tenant
    const tenant = await Tenant.create({
      businessName,
      ownerEmail: email,
      plan: "free",
      status: "active",
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
      tenantId: tenant._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      tenant,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("registerClient error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ─── WHY: Включваме tenantId в JWT token-а, за да го имаме
    // автоматично на всяка protected route без допълнителна DB заявка.
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
