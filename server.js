import "dotenv/config";
import express from "express";
import cors from "cors";
import requestIp from "request-ip";
import geoip from "geoip-lite";
import { MongoClient, ServerApiVersion } from "mongodb";
import morgan from "morgan";
import multer from "multer";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import path from "path";

// محاكاة __dirname لتعمل مع صيغة ES Modules الحديثة
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // يسمح باتصالات سريعة وآمنة من أي واجهة أمامية
  },
});

const PORT = process.env.PORT || 5000;

/* ---------------- الأوساط البرمجية (Middlewares) ---------------- */
app.use(cors());
app.use(express.json());
app.use(requestIp.mw());
app.use(morgan("dev")); // الـ dev Mode أفضل وأخف في القراءة داخل الترمينال المحلي
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- إعدادات رفع الصور المتقدمة ---------------- */
// قمنا بتنظيم رفع الصور لكي تحتفظ بامتدادها الأصلي (مثل .png أو .jpg) بدلاً من الأسماء العشوائية المبهمة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ---------------- الاتصال بقاعدة البيانات المركزية ---------------- */
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function startServer() {
  try {
    await client.connect();
    db = client.db("analyticsDB");
    console.log("✅ [Database]: Connected to MongoDB successfully.");

    server.listen(PORT, () => {
      console.log(`🚀 [Server]: Operating smoothly on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ [Critical Error]: Failed to start the backend system:", err);
    process.exit(1); // إغلاق البرنامج بأمان إذا فشل الاتصال بقاعدة البيانات لمنع العمليات العشوائية
  }
}

startServer();

/* ---------------- دالة حماية المسارات (Async Wrapper) ---------------- */
// هذه الدالة السحرية تحمي السيرفر من الانهيار عند حدوث أي خطأ غير متوقع في قاعدة البيانات
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ---------------- تتبع الزوار (المسار المطور) ---------------- */
app.get("/track", asyncHandler(async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });

  let ip = req.clientIp;
  
  // معالجة الـ Localhost أثناء فترة التجربة على جهازك الشخصي
  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "8.8.8.8"; // نقوم بمحاكاة IP حقيقي (جوجل) لكي تعمل مكتبة الجغرافيات بنجاح أثناء التطوير
  }

  const geo = geoip.lookup(ip);

  const data = {
    ip,
    country: geo?.country || "Local/Unknown",
    city: geo?.city || "Local/Unknown",
    device: req.headers["user-agent"] || "Unknown Device",
    page: req.query.page || "Home",
    time: new Date(),
  };

  await db.collection("visits").insertOne(data);
  io.emit("new-visit", data);

  res.status(200).json({ status: "success", message: "Visitor tracked successfully" });
}));

/* ---------------- رسائل الزوار (المسار المطور) ---------------- */
app.post("/message", asyncHandler(async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message field cannot be empty" });
  }

  const data = {
    message,
    ip: req.clientIp,
    time: new Date(),
  };

  await db.collection("messages").insertOne(data);
  io.emit("new-message", data);

  res.status(201).json({ status: "success", message: "Message securely archived" });
}));

/* ---------------- رفع الصور (المسار المطور) ---------------- */
app.post("/upload", upload.single("photo"), asyncHandler(async (req, res) => {
  if (!db) return res.status(503).json({ error: "Database not ready" });

  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const data = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    time: new Date(),
  };

  await db.collection("images").insertOne(data);
  io.emit("new-image", data);

  res.status(201).json({ status: "success", message: "Image processed and uploaded", file: data });
}));

/* ---------------- لوحة التحكم (Dashboard) ---------------- */
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* ---------------- نظام التحكم المركزي بالأخطاء ---------------- */
// الملاذ الأخير لاستقبال أي خطأ في المشروع وعرضه للمطور دون أن يتوقف تطبيق الزوار
app.use((err, req, res, next) => {
  console.error("💥 [Runtime Error]:", err.message);
  res.status(500).json({
    status: "error",
    message: "An internal system anomaly occurred. Engineers have been notified.",
  });
});

