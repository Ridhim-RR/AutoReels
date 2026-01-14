import express from "express";
import multer from "multer";

const app = express();
const port = 8000;

// Increase limits to support large video uploads (e.g., 500MB)
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
const upload  = multer({limits: { fileSize: 500 * 1024 * 1024 }}); // 500MB limit

app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  // Here you can process the uploaded file (req.file)
  res.status(200).send(`File ${req.file.originalname} uploaded successfully.`);
});

app.listen(port, () => {
  console.log(`API server is running at http://localhost:${port}`);
});
export default app;
