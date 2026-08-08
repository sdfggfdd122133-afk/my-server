require("dotenv").config();

const express = require("express");
const cors = require("cors");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const { MongoClient, ServerApiVersion } = require("mongodb");
const morgan = require("morgan");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

/* ---------------- Middlewares ---------------- */

app.use(cors());
app.use(express.json());
app.use(requestIp.mw());
app.use(morgan("combined"));
app.use(express.static("public"));

/* ---------------- رفع الصور ---------------- */

const upload = multer({ dest: "uploads/" });

/* ---------------- قاعدة البيانات ---------------- */

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

let db;

async function connectDB() {
  try {
    await client.connect();

    db = client.db("analyticsDB");

    console.log("✅ MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}

connectDB();

/* ---------------- تتبع الزوار ---------------- */

app.get("/track", async (req, res) => {
  if (!db) return res.status(500).send("DB not connected");

  const ip = req.clientIp;
  const geo = geoip.lookup(ip);

  const data = {
    ip,
    country: geo?.country || "Unknown",
    city: geo?.city || "Unknown",
    device: req.headers["user-agent"],
    page: req.query.page || "Unknown",
    time: new Date()
  };

  await db.collection("visits").insertOne(data);

  io.emit("new-visit", data);

  res.send("Tracked");
});

/* ---------------- الرسائل ---------------- */

app.post("/message", async (req, res) => {
  if (!db) return res.status(500).send("DB not connected");

  const message = req.body.message;

  const data = {
    message,
    ip: req.clientIp,
    time: new Date()
  };

  await db.collection("messages").insertOne(data);

  io.emit("new-message", data);

  res.send("Message saved");
});

/* ---------------- رفع الصور ---------------- */

app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!db) return res.status(500).send("DB not connected");

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const data = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    time: new Date()
  };

  await db.collection("images").insertOne(data);

  io.emit("new-image", data);

  res.send("Image uploaded");
});

/* ---------------- لوحة التحكم ---------------- */

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});
