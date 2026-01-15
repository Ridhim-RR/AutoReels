import { parseSRT, TranscriptSegment } from "./transcribe";

export interface ChunkScore {
  chunk: string;
  srtPath: string;
  score: number;
  wordCount: number;
  duration: number;
}

/**
 * Scores a video chunk based on its transcription quality.
 * Higher scores indicate better content for reels.
 *
 * Scoring factors:
 * - Word density (words per second)
 * - Total word count
 * - Sentence completeness
 */
export async function scoreChunk(
  chunkPath: string,
  srtPath: string | null
): Promise<ChunkScore> {
  if (!srtPath) {
    return {
      chunk: chunkPath,
      srtPath: "",
      score: 0,
      wordCount: 0,
      duration: 0,
    };
  }
  const segments = parseSRT(srtPath);

  const wordCount = countWords(segments);
  const duration = getDuration(segments);
  const score = calculateScore(segments, wordCount, duration);

  return {
    chunk: chunkPath,
    srtPath,
    score,
    wordCount,
    duration,
  };
}

/**
 * Counts total words across all segments
 */
function countWords(segments: TranscriptSegment[]): number {
  return segments.reduce((total, seg) => {
    const words = seg.text.split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);
}

/**
 * Gets total duration from segments
 */
function getDuration(segments: TranscriptSegment[]): number {
  if (segments.length === 0) return 0;
  const lastSegment = segments[segments.length - 1];
  return lastSegment.end;
}

/**
 * Calculates a score based on multiple factors
 */
function calculateScore(
  segments: TranscriptSegment[],
  wordCount: number,
  duration: number
): number {
  if (duration === 0 || wordCount === 0) return 0;

  // Factor 1: Words per second (ideal: 2-3 words/sec for engaging content)
  const wordsPerSecond = wordCount / duration;
  const densityScore = Math.min(wordsPerSecond / 2.5, 1) * 40; // Max 40 points

  // Factor 2: Total word count (more content = more material to work with)
  const wordCountScore = Math.min(wordCount / 50, 1) * 30; // Max 30 points

  // Factor 3: Coverage (how much of the duration has speech)
  const speechDuration = segments.reduce(
    (sum, seg) => sum + (seg.end - seg.start),
    0
  );
  const coverageRatio = speechDuration / duration;
  const coverageScore = coverageRatio * 20; // Max 20 points

  // Factor 4: Segment count (more segments = more dynamic content)
  const segmentScore = Math.min(segments.length / 10, 1) * 10; // Max 10 points

  return Math.round(
    densityScore + wordCountScore + coverageScore + segmentScore
  );
}

/**
 * Picks the top N chunks based on their scores
 */
export function pickTopChunks(
  scores: ChunkScore[],
  count: number = 3
): ChunkScore[] {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, count);
}

/**
 * Filters out chunks below a minimum score threshold
 */
export function filterByMinScore(
  scores: ChunkScore[],
  minScore: number = 30
): ChunkScore[] {
  return scores.filter((s) => s.score >= minScore);
}
