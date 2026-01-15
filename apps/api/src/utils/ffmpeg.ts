import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { existsSync } from "node:fs";

const FFmpeg = ffmpegPath && existsSync(ffmpegPath) ? ffmpegPath : "ffmpeg";

export function runFFmpeg(
  args: string[],
  opts?: { timeoutMs?: number }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ff = spawn(FFmpeg, ["-y", ...args]);

    let stderr = "";

    ff.stderr.on("data", (data) => {
      stderr += data.toString();
      console.log(data.toString());
    });

    const timeout = opts?.timeoutMs
      ? setTimeout(() => {
          ff.kill("SIGKILL");
          reject(new Error("FFmpeg timeout"));
        }, opts.timeoutMs)
      : null;

    ff.on("close", (code) => {
      if (timeout) clearTimeout(timeout);

      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed (${code})\n${stderr}`));
    });
  });
}
