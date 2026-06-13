require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const leadRoutes = require("./routes/leadRoutes");
const connectDB = require("./config/db");


connectDB();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/leads", leadRoutes);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "MaxAI SaaS Backend",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime()
  });
});

/*
|--------------------------------------------------------------------------
| WebSocket Connection
|--------------------------------------------------------------------------
*/

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 MaxAI backend running on port ${PORT}`);
});