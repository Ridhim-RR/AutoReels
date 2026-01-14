import fs from "node:fs";
import path from "node:path";

export function getChunks(chunksDir: string): string[] {
  return fs
    .readdirSync(chunksDir)
    .filter((file) => file.startsWith("chunk_") && file.endsWith(".mp4"))
    .sort() // ensures chunk_000, chunk_001, ...
    .map((file) => path.join(chunksDir, file));
}
