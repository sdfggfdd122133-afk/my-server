require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");
const requestIp = require("request-ip");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

const PORT = process.env.PORT || 7860;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(
  supabaseUrl || "https://supabase.co", 
  supabaseKey || "placeholder-key"
);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const telegramEnabled = Boolean(TELEGRAM_BOT_TOKEN) && Boolean(TELEGRAM_CHAT_ID);

app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(requestIp.mw());

const publicPath = path.join(__dirname, "public");
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const hash = crypto.randomBytes(8).toString("hex");
    cb(null, hash + extension);
  }
});

const upload = multer({ storage });

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "'");
}

function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
}

async function sendTelegramMessage(text) {
  if (!telegramEnabled) return { success: false, skipped: true };
  try {
    const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) return { success: false };
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

async function notifyNewVisit(visitor) {
  const text = "<b>New Visit</b>\n\nCountry: " + escapeHtml(visitor.country) + "\nCity: " + escapeHtml(visitor.city) + "\nDevice: " + escapeHtml(visitor.device) + "\nPage: " + escapeHtml(visitor.page) + "\nLocal ID: " + hashData(visitor.ip);
  return sendTelegramMessage(text);
}

async function notifyNewMessage(message) {
  const text = "<b>New Message</b>\n\nPhone: " + escapeHtml(message.phone) + "\nCountry: " + escapeHtml(message.country) + "\nCity: " + escapeHtml(message.city) + "\nLocal ID: " + hashData(message.ip) + "\n\nMessage:\n" + escapeHtml(message.message);
  return sendTelegramMessage(text);
}

async function notifyImageUpload(image) {
  const text = "<b>New Image</b>\n\nFile: " + escapeHtml(image.filename) + "\nDescription: " + escapeHtml(image.desc) + "\nPosition: " + escapeHtml(image.position);
  return sendTelegramMessage(text);
}

let onlineUsers = 0;
io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-users", onlineUsers);
  socket.on("disconnect", () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit("online-users", onlineUsers);
  });
});

function getRealVisitorIp(req) {
  let ip = req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.clientIp || req.ip;
  if (ip && ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  const localIps = ["127.0.0.1", "::1", "0.0.0.0"];
  if (!ip || localIps.includes(ip) || ip.startsWith("192.168.") || ip.startsWith("10.")) return null;
  return ip;
}

async function getGeoData(ip) {
  if (!ip) return { country: "Local", city: "Local" };
  try {
    const response = await fetch(`http://ip-api.com{ip}`);
    const data = await response.json();
    if (data && data.status === "success") {
      return { country: data.country || "Unknown", city: data.city || "Unknown" };
    }
  } catch (error) {}
  return { country: "Unknown", city: "Unknown" };
}

app.post("/api/visit", async (req, res) => {
  try {
    const ip = getRealVisitorIp(req) || "127.0.0.1";
    const geo = await getGeoData(ip);
    const visitorData = { ip, country: geo.country, city: geo.city, device: req.body.device || "Unknown Device", page: req.body.page || "Home", created_at: new Date() };
    
    await supabase.from("visits").insert([visitorData]);
    await notifyNewVisit(visitorData);
    res.status(200).json({ success: true, geo });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const ip = getRealVisitorIp(req) || "127.0.0.1";
    const geo = await getGeoData(ip);
    const messageData = { phone: req.body.phone, message: req.body.message, ip, country: geo.country, city: geo.city, created_at: new Date() };
    
    await supabase.from("messages").insert([messageData]);
    await notifyNewMessage(messageData);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageData = { filename: req.file.filename, desc: req.body.desc || "", position: req.body.position || "0", created_at: new Date() };
    
    await supabase.from("images").insert([imageData]);
    await notifyImageUpload(imageData);
    res.status(200).json({ success: true, file: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 السيرفر يعمل بنجاح تـام ومحمي محلـياً!");
});

module.exports = app;

