import { runFFmpeg } from "../utils/ffmpeg";

export async function extractAudio(
  videoPath: string,
  audioPath: string
) {
  await runFFmpeg([
    "-i", videoPath,
    "-vn",
    "-ac", "1",
    "-ar", "16000",
    `${audioPath}.wav`
  ]);
}
