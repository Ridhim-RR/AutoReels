import { runFFmpeg } from "../utils/ffmpeg";
import * as fs from "fs";

export async function splitVideo(
  inputPath: string,
  outputDir: string
) {
  // Create output directory if it doesn't exist
  fs.mkdirSync(outputDir, { recursive: true });
  
  await runFFmpeg([
    "-i", inputPath,
    "-map", "0",
    "-segment_time", "20",
    "-f", "segment",
    "-reset_timestamps", "1",
    `${outputDir}/chunk_%03d.mp4`
  ]);
}
