"use client";

import React, { useEffect } from "react";
import Link from "next/link";

/**
 * Legacy redirect for /learn → /from-scratch
 * The canonical "Rocket Science from Scratch" path is now at /from-scratch.
 * This keeps old links and bookmarks working.
 */
export default function LearnLegacyRedirect() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/from-scratch";
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-[#E30613] text-sm tracking-[2px] mb-2">REDIRECTING</div>
        <h1 className="text-3xl font-semibold mb-3">Rocket Science from Scratch has moved</h1>
        <p className="text-[#a1a1aa] mb-6">The main progressive learning path is now at <span className="text-[#00d4ff]">/from-scratch</span>.</p>
        <Link href="/from-scratch" className="btn-primary inline-block">Go to From Scratch Learning Path →</Link>
        <div className="mt-4 text-xs text-[#666]">You will be redirected automatically…</div>
      </div>
    </div>
  );
}
