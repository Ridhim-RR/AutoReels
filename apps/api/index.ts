import "dotenv/config";
import express, {Express} from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { processVideo } from "./src/pipeline/process";

const app: Express = express();
const port = 8000;

// Create upload directory
const UPLOAD_DIR = "uploads";
const OUTPUT_DIR = "output";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Configure multer to save files to disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".mp4", ".mov", ".avi", ".mkv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowed.join(", ")}`));
    }
  },
});

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Upload and process video
app.post("/process", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file uploaded" });
  }

  const videoPath = req.file.path;
  const jobId = Date.now().toString();

  try {
    console.log(`\n🎬 Starting job ${jobId}: ${req.file.originalname}`);

    const result = await processVideo(videoPath, {
      chunksDir: `temp/${jobId}/chunks`,
      outputDir: `${OUTPUT_DIR}/${jobId}`,
      topCount: Number(req.query.count) || 3,
    });

    res.status(200).json({
      success: true,
      jobId,
      reels: result.finalVideos,
      scores: result.selectedChunks.map((c) => ({
        score: c.score,
        words: c.wordCount,
      })),
    });
  } catch (error) {
    console.error("❌ Processing failed:", error);
    res.status(500).json({
      error: "Processing failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Serve output files
app.use("/output", express.static(OUTPUT_DIR));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`🚀 AutoReels API running at http://localhost:${port}`);
  console.log(`   POST /process - Upload video to process`);
  console.log(`   GET  /output/:jobId/:file - Download results`);
});

export default app;
