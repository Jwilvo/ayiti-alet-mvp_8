import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TIP_AKSEPTE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ekstansyon = TIP_AKSEPTE[file.mimetype] ?? path.extname(file.originalname) ?? "";
    cb(null, `${Date.now()}_${crypto.randomBytes(6).toString("hex")}${ekstansyon}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIP_AKSEPTE[file.mimetype]) {
      return cb(new Error("Sèl imaj (JPEG, PNG, WEBP, GIF) aksepte kounye a."));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("fichye"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erè: "Pa gen okenn fichye ki voye." });
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    tip: "foto",
  });
});

router.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ erè: "Imaj la twò gwo (maksimòm 8 Mo)." });
    }
    return res.status(400).json({ erè: err.message });
  }
  if (err) {
    return res.status(400).json({ erè: err.message || "Erè pandan telechajman an." });
  }
  res.status(500).json({ erè: "Erè sèvè." });
});

export default router;
export { UPLOAD_DIR };
