import { runFFmpeg } from "../utils/ffmpeg";

export async function burnCaptions(
  video: string,
  srtPath: string,
  output: string
) {
  await runFFmpeg([
    "-i", video,
    "-vf",
    `subtitles=${srtPath}:force_style='Fontsize=28,Outline=2'`,
    output
  ]);
}
