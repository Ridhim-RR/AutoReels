import { runFFmpeg } from "../utils/ffmpeg";

export async function cropVertical(
  input: string,
  output: string
) {
  await runFFmpeg([
    "-i", input,
    "-vf", "crop=ih*9/16:ih",
    "-s", "1080x1920",
    output
  ]);
}
