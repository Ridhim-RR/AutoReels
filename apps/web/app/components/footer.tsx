'use client';

import Link from "next/link";
import React from "react";
import { FaFingerprint } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-hero-background text-foreground py-10">
      <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <FaFingerprint className="min-w-fit w-5 h-5 md:w-7 md:h-7" />
            <h3 className="manrope text-xl font-semibold cursor-pointer">
              AutoReels
            </h3>
          </Link>
          <p className="mt-3.5 text-foreground-accent">
            AutoReels is an AI-powered tool that turns your long videos into
            ready-to-post reels automatically.{" "}
          </p>
        </div>
        <div>
         
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <a
              href={`mailto:ridhimraizada.rr@gmail.com`}
              className="block text-foreground-accent hover:text-foreground"
            >
              Email: ridhimraizada.rr@gmail.com
            </a>
        </div>
      </div>
      <div className="mt-8 md:text-center text-foreground-accent px-6">
        <p>
          Copyright &copy; {new Date().getFullYear()} AutoReels. All rights
          reserved.
        </p>
        <p className="text-sm mt-2 text-gray-500">
          Made with &hearts; by <span>Ridhim Singh Raizada</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
