"use client";
import Image from "next/image";
import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";

interface ProcessResponse {
  success: boolean;
  reels: any[]; // replace with proper type if you know it
  jobId: string;
}


export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    // Create a FormData object to send the video file
    setLoading(true);
    const formData = new FormData();
    formData.append("video", video);

    // Send the video to the server (replace '/api/generate-reels' with your actual endpoint)
    fetch(`${baseUrl}/api/v1/process`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data: ProcessResponse) => {
        // Handle the response data
        console.log("Reels generated:", data);
        if (data.success) {
          setReels(data.reels);
          setJobId(data.jobId);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error generating reels:", error);
      });
  };
  return (
    <>
      <Header />
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center pb-0 pt-32 md:pt-40 px-5"
      >
        <div className="absolute left-0 top-0 bottom-0 -z-10 w-full">
          <div className="absolute inset-0 h-full w-full bg-hero-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        </div>

        <div className="absolute left-0 right-0 bottom-0 "></div>

        <div className="text-center">
          <h1 className="text-4xl md:text-6xl md:leading-tight font-bold text-foreground max-w-lg md:max-w-2xl mx-auto">
            Generate Reels
          </h1>
          <p className="text-2xl mt-4 text-foreground max-w-lg mx-auto">
            With juist a click
          </p>
        </div>

        <form className="w-full max-w-md mt-6 mb-4" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center space-y-6 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900 mt-8 border border-zinc-200 dark:border-zinc-800">
            {/* Upload box */}
            <label
              htmlFor="video"
              className="w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center hover:border-black dark:hover:border-white transition"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-4xl">🎬</div>

                {!video ? (
                  <>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      Click to upload a video
                    </p>
                    <p className="text-sm text-zinc-500">
                      MP4, MOV • Max 100MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-green-600">{video.name}</p>
                    <p className="text-sm text-zinc-500">
                      {(video.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                )}
              </div>

              <input
                id="video"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setVideo(e.target.files[0]);
                  }
                }}
              />
            </label>

            {/* Submit button */}
            {reels.length > 0 && jobId ? (
              <div className="w-full">
                {reels.map((reelUrl, index) => (
                  <a
                    key={index}
                    href={`${baseUrl}/${reelUrl}`}
                    download={`reel_${index + 1}.mp4`}
                    className="mb-6 block w-full text-center rounded-lg px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                  >
                    Download Reel {index + 1}
                  </a>
                ))}
              </div>
            ) : (
              <button
                type="submit"
                disabled={!video || loading}
                className={`w-full rounded-lg px-6 py-3 text-white font-semibold transition flex items-center justify-center
    ${video ? "bg-black hover:bg-zinc-800" : "bg-zinc-400 cursor-not-allowed"}
  `}
              >
                {loading ? loader : "Generate Reels"}
              </button>
            )}

            {/* Helper text */}
            <p className="text-xs text-zinc-500 text-center">
              By uploading, you confirm you own the rights to this video.
            </p>
          </div>
        </form>
      </section>
      <Footer />
    </>
  );
}

const loader = (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
