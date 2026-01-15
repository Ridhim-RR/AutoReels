import { spawn } from "node:child_process";

export function hasAudio(videoPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-select_streams", "a:0",
      "-show_entries", "stream=codec_type,duration,bit_rate",
      "-of", "json",
      videoPath,
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        resolve(false);
        return;
      }

      try {
        const data = JSON.parse(output);
        const streams = data.streams || [];
        
        if (streams.length === 0) {
          resolve(false);
          return;
        }

        const audioStream = streams[0];
        // Check that audio stream has valid duration (> 0) or bit_rate
        const duration = parseFloat(audioStream.duration);
        const bitRate = parseInt(audioStream.bit_rate, 10);
        
        const hasValidAudio = 
          audioStream.codec_type === "audio" &&
          ((!isNaN(duration) && duration > 0) || (!isNaN(bitRate) && bitRate > 0));
        
        resolve(hasValidAudio);
      } catch {
        resolve(false);
      }
    });

    ffprobe.on("error", () => {
      resolve(false);
    });
  });
}
