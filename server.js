require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");
const requestIp = require("request-ip");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 7860;

// =========================
// Telegram
// =========================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const telegramEnabled =
  Boolean(TELEGRAM_BOT_TOKEN) && Boolean(TELEGRAM_CHAT_ID);

// =========================
// Socket.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

// =========================
// Express
// =========================

app.set("trust proxy", true);

app.use(cors());

app.use(
  express.json({
    limit: "2mb"
  })
);

app.use(requestIp.mw());

// =========================
// Paths
// =========================

const publicPath = path.join(__dirname, "public");
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, {
    recursive: true
  });
}

app.use(express.static(publicPath));

app.use(
  "/uploads",
  express.static(uploadsPath)
);

// =========================
// Uploads
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const hash = crypto
      .randomBytes(8)
      .toString("hex");

    cb(null, hash + extension);
  }
});

const upload = multer({
  storage
});

// =========================
// Helpers
// =========================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function hashData(data) {
  return crypto
    .createHash("sha256")
    .update(String(data))
    .digest("hex")
    .substring(0, 16);
}

// =========================
// Telegram Sender
// =========================

async function sendTelegramMessage(text) {
  if (!telegramEnabled) {
    return {
      success: false,
      skipped: true
    };
  }

  try {
    const url =
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML"
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", data);

      return {
        success: false
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Telegram connection error:", error);

    return {
      success: false
    };
  }
}

// =========================
// Telegram Notifications
// =========================

async function notifyNewVisit(visitor) {
  const text =
    "<b>New Visit</b>\n\n" +
    "Country: " + escapeHtml(visitor.country) + "\n" +
    "City: " + escapeHtml(visitor.city) + "\n" +
    "Device: " + escapeHtml(visitor.device) + "\n" +
    "Page: " + escapeHtml(visitor.page) + "\n" +
    "Local ID: " + hashData(visitor.ip);

  return sendTelegramMessage(text);
}

async function notifyNewMessage(message) {
  const text =
    "<b>New Message</b>\n\n" +
    "Phone: " + escapeHtml(message.phone) + "\n" +
    "Country: " + escapeHtml(message.country) + "\n" +
    "City: " + escapeHtml(message.city) + "\n" +
    "Local ID: " + hashData(message.ip) +
    "\n\n" +
    "Message:\n" +
    escapeHtml(message.message);

  return sendTelegramMessage(text);
}

async function notifyImageUpload(image) {
  const text =
    "<b>New Image</b>\n\n" +
    "File: " + escapeHtml(image.filename) + "\n" +
    "Description: " + escapeHtml(image.desc) + "\n" +
    "Position: " + escapeHtml(image.position);

  return sendTelegramMessage(text);
}

// =========================
// Online Users
// =========================

let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;

  io.emit(
    "online-users",
    onlineUsers
  );

  socket.on("disconnect", () => {
    onlineUsers = Math.max(
      0,
      onlineUsers - 1
    );

    io.emit(
      "online-users",
      onlineUsers
    );
  });
});

// =========================
// Visitor IP
// =========================

function getRealVisitorIp(req) {
  let ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.clientIp ||
    req.ip;

  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  const localIps = [
    "127.0.0.1",
    "::1",
    "0.0.0.0"
  ];

  if (
    !ip ||
    localIps.includes(ip) ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return null;
  }

  return ip;
}

// =========================
// GeoIP
// =========================

async function getGeoData(ip) {
  if (!ip) {
    return {
      country: "Local",
      city: "Local"
    };
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}`
    );

    const data = await response.json();

    if (
      data &&
      data.status === "success"
    ) {
      return {
        country: data.country || "Unknown",
        city: data.city || "Unknown"
      };
    }
  } catch (error) {
    console.error("GeoIP error:", error);
  }

  return {
    country: "Unknown",
    city: "Unknown"
  };
}

// =========================
// Visit API
// =========================

app.post("/api/visit", async (req, res) => {
  try {
    const ip =
      getRealVisitorIp(req) ||
      "127.0.0.1";

    const geo =
      await getGeoData(ip);

    const visitorData = {
      ip,
      country: geo.country,
      city: geo.city,
      device:
        req.body.device ||
        "Unknown Device",
      page:
        req.body.page ||
        "Home",
      created_at: new Date()
    };

    // Telegram فقط
    await notifyNewVisit(
      visitorData
    );

    return res.status(200).json({
      success: true,
      geo
    });
  } catch (error) {
    console.error(
      "Visit API error:",
      error
    );

    return res.status(500).json({
      success: false
    });
  }
});

// =========================
// Message API
// =========================

app.post("/api/message", async (req, res) => {
  try {
    const ip =
      getRealVisitorIp(req) ||
      "127.0.0.1";

    const geo =
      await getGeoData(ip);

    const messageData = {
      phone: req.body.phone || "",
      message: req.body.message || "",
      ip,
      country: geo.country,
      city: geo.city,
      created_at: new Date()
    };

    // Telegram فقط
    await notifyNewMessage(
      messageData
    );

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(
      "Message API error:",
      error
    );

    return res.status(500).json({
      success: false
    });
  }
});

// =========================
// Image Upload API
// =========================

app.post(
  "/api/upload",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded"
        });
      }

      const imageData = {
        filename: req.file.filename,
        desc: req.body.desc || "",
        position:
          req.body.position || "0",
        created_at: new Date()
      };

      // Telegram فقط
      await notifyImageUpload(
        imageData
      );

      return res.status(200).json({
        success: true,
        file: req.file.filename
      });
    } catch (error) {
      console.error(
        "Upload API error:",
        error
      );

      return res.status(500).json({
        success: false
      });
    }
  }
);

// =========================
// Health Check
// =========================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "online",
    telegram: telegramEnabled,
    time: new Date().toISOString()
  });
});

// =========================
// Home
// =========================

app.get("/", (req, res) => {
  res.send(
    "🚀 السيرفر يعمل بنجاح تام ومحمي محلياً!"
  );
});

// =========================
// Vercel Export
// =========================

module.exports = app;

// =========================
// Local / Render Server
// =========================

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(
      `🚀 Real Main Cloud Server running perfectly on port ${PORT}`
    );
  });
}
