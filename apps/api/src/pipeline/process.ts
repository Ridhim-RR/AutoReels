import { extractAudio } from "./audio";
import { burnCaptions } from "./caption";
import { cropVertical } from "./crop";
import { splitVideo } from "./split";
import { transcribe } from "./transcribe";
import { scoreChunk, pickTopChunks, ChunkScore } from "./scoring";
import { getChunks } from "../utils/chunk";

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
 * 4. Score chunks based on transcription
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
    chunksDir = "chunks",
    outputDir = "output",
    topCount = 3,
  } = options;

  // Step 1: Split video into chunks
  console.log("[1/6] Splitting video into chunks...");
  await splitVideo(inputVideo, chunksDir);

  // Ensure output directory exists
  const fs = require("fs");
  fs.mkdirSync(outputDir, { recursive: true });

  // Step 2-4: Process each chunk
  const chunks = getChunks(chunksDir);
  console.log(`[2/6] Processing ${chunks.length} chunks...`);

  const scores: ChunkScore[] = [];

  for (const chunk of chunks) {
    const baseName = chunk.replace(".mp4", "");
    
    // Extract audio
    console.log(`  → Extracting audio: ${chunk}`);
    await extractAudio(chunk, baseName);
    
    // Transcribe to SRT
    console.log(`  → Transcribing: ${baseName}.wav`);
    const srtPath = await transcribe(`${baseName}.wav`);
    
    // Score the chunk
    console.log(`  → Scoring: ${chunk}`);
    const chunkScore = await scoreChunk(chunk, srtPath);
    scores.push(chunkScore);
    
    console.log(`  ✓ Score: ${chunkScore.score} (${chunkScore.wordCount} words)`);
  }

  // Step 5: Pick top chunks
  console.log(`[5/6] Selecting top ${topCount} chunks...`);
  const selected = pickTopChunks(scores, topCount);
  
  for (const s of selected) {
    console.log(`  ★ ${s.chunk} (score: ${s.score})`);
  }

  // Step 6: Generate final reels
  console.log("[6/6] Generating final reels...");
  const finalVideos: string[] = [];

  for (let i = 0; i < selected.length; i++) {
    const { chunk, srtPath } = selected[i];
    const reelName = `reel_${String(i + 1).padStart(2, "0")}`;
    
    const croppedPath = `${outputDir}/${reelName}_vertical.mp4`;
    const finalPath = `${outputDir}/${reelName}_final.mp4`;

    console.log(`  → Cropping: ${chunk}`);
    await cropVertical(chunk, croppedPath);
    
    console.log(`  → Burning captions: ${croppedPath}`);
    await burnCaptions(croppedPath, srtPath, finalPath);
    
    finalVideos.push(finalPath);
    console.log(`  ✓ Created: ${finalPath}`);
  }

  console.log(`\n✅ Done! Created ${finalVideos.length} reels.`);

  return {
    finalVideos,
    selectedChunks: selected,
  };
}
