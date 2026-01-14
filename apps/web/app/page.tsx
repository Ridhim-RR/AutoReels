"use client";
import Image from "next/image";
import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
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

        <form className="w-full max-w-md mt-6 mb-4">
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
            <button
              type="submit"
              disabled={!video}
              className={`w-full rounded-lg px-6 py-3 text-white font-semibold transition
        ${
          video
            ? "bg-black hover:bg-zinc-800"
            : "bg-zinc-400 cursor-not-allowed"
        }
      `}
            >
              Generate Reels
            </button>

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
