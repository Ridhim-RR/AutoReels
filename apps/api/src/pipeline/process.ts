import fs from "node:fs";
import path from "node:path";

import { extractAudio } from "./audio";
import { burnCaptions } from "./caption";
import { cropVertical } from "./crop";
import { splitVideo } from "./split";
import { transcribe } from "./transcribe";
import { scoreChunk, pickTopChunks, ChunkScore } from "./scoring";
import { getChunks } from "../utils/chunk";
import { hasAudio } from "../utils/hasAudio";

export interface ProcessResult {
  finalVideos: string[];
  selectedChunks: ChunkScore[];
}

/**
 * Processes a long video into multiple short-form reels.
 *
 * Pipeline:
 * 1. Split video into ~20s chunks
 * 2. Extract audio from each chunk
 * 3. Transcribe audio to SRT
 * 4. Score chunks
 * 5. Pick top chunks
 * 6. Crop to vertical (9:16) and burn captions
 */
export async function processVideo(
  inputVideo: string,
  options: {
    chunksDir?: string;
    outputDir?: string;
    topCount?: number;
  } = {}
): Promise<ProcessResult> {
  const {
    chunksDir = "temp/chunks",
    outputDir = "output",
    topCount = 3,
  } = options;

  // -----------------------------
  // Ensure required directories exist
  // -----------------------------
  fs.mkdirSync(chunksDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`📁 chunksDir: ${chunksDir}`);
  console.log(`📁 outputDir: ${outputDir}`);

  // -----------------------------
  // Step 1: Split video
  // -----------------------------
  console.log("[1/6] Splitting video into chunks...");
  await splitVideo(inputVideo, chunksDir);

  // -----------------------------
  // Step 2–4: Process each chunk
  // -----------------------------
  const chunks = getChunks(chunksDir);
  console.log(`[2/6] Processing ${chunks.length} chunks...`);

  const scores: ChunkScore[] = [];

  for (const chunk of chunks) {
    const baseName = chunk.replace(/\.mp4$/, "");
    const audioPath = `${baseName}.wav`;

    // Check if chunk has audio
    const audioExists = await hasAudio(chunk);
    let srtPath: string | null = null;

    if (audioExists) {
      try {
        // 2️⃣ Extract audio
        console.log(`  → Extracting audio: ${chunk}`);
        await extractAudio(chunk, baseName);

        // 3️⃣ Transcribe
        console.log(`  → Transcribing: ${audioPath}`);
        srtPath = await transcribe(audioPath);
      } catch (err) {
        console.log(`  ⚠ Audio extraction/transcription failed for: ${chunk} (skipping)`);
        srtPath = null;
      }
    } else {
      console.log(`  ⚠ No audio in: ${chunk} (skipping transcription)`);
    }

    // 4️⃣ Score
    console.log(`  → Scoring: ${chunk}`);
    const chunkScore = await scoreChunk(chunk, srtPath);
    scores.push(chunkScore);

    console.log(
      `  ✓ Score: ${chunkScore.score.toFixed(2)} (${chunkScore.wordCount} words)`
    );
  }

  // -----------------------------
  // Step 5: Pick top chunks
  // -----------------------------
  console.log(`[5/6] Selecting top ${topCount} chunks...`);
  const selected = pickTopChunks(scores, topCount);

  for (const s of selected) {
    console.log(`  ★ ${s.chunk} (score: ${s.score.toFixed(2)})`);
  }

  // -----------------------------
  // Step 6: Generate final reels
  // -----------------------------
  console.log("[6/6] Generating final reels...");
  const finalVideos: string[] = [];

  for (let i = 0; i < selected.length; i++) {
    const { chunk, srtPath } = selected[i];
    const reelBase = `reel_${String(i + 1).padStart(2, "0")}`;

    const verticalPath = path.join(outputDir, `${reelBase}_vertical.mp4`);
    const finalPath = path.join(outputDir, `${reelBase}_final.mp4`);

    console.log(`  → Cropping to vertical: ${chunk}`);
    await cropVertical(chunk, verticalPath);

    console.log(`  → Burning captions: ${verticalPath}`);
    await burnCaptions(verticalPath, srtPath, finalPath);

    finalVideos.push(finalPath);
    console.log(`  ✓ Created: ${finalPath}`);
  }

  console.log(`\n✅ Done! Created ${finalVideos.length} reels.`);

  return {
    finalVideos,
    selectedChunks: selected,
  };
}
