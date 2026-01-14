import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Transcribes audio using Whisper API and generates SRT
 */
export async function transcribe(audioPath: string): Promise<string> {
  const outputDir = path.dirname(audioPath);
  const baseName = path.basename(audioPath, path.extname(audioPath));
  const srtPath = path.join(outputDir, `${baseName}.srt`);

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
  });

  const srt = segmentsToSRT(response.segments || []);
  fs.writeFileSync(srtPath, srt);

  return srtPath;
}

/**
 * Convert Whisper segments → SRT
 */
function segmentsToSRT(segments: any[]): string {
  return segments
    .map((seg, i) => {
      return `${i + 1}
${toSrtTime(seg.start)} --> ${toSrtTime(seg.end)}
${seg.text.trim()}

`;
    })
    .join("");
}

function toSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, "0");
}

/**
 * Parses an SRT file and returns transcript segments
 */
export function parseSRT(srtPath: string): TranscriptSegment[] {
  const content = fs.readFileSync(srtPath, "utf-8");
  const segments: TranscriptSegment[] = [];

  const blocks = content.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 3) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
    );

    if (!timeMatch) continue;

    const [, h1, m1, s1, ms1, h2, m2, s2, ms2] = timeMatch;
    const start = +h1 * 3600 + +m1 * 60 + +s1 + +ms1 / 1000;
    const end = +h2 * 3600 + +m2 * 60 + +s2 + +ms2 / 1000;
    const text = lines.slice(2).join(" ").trim();

    segments.push({ start, end, text });
  }

  return segments;
}
