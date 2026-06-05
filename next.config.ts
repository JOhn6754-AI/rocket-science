import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Cloudflare Pages static hosting (recommended for Phase 0-1)
  // All simulators and state are 100% client-side (Zustand + localStorage).
  // This produces a pure static site that deploys beautifully to CF Pages.
  output: "export",

  // Recommended for static export + images (if we add any later)
  images: {
    unoptimized: true,
  },

  // Strict mode is great for catching issues early
  reactStrictMode: true,

  // Future: when we want server components / API routes for auth/sync,
  // remove output: 'export' and use the Cloudflare adapter:
  // https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-nextjs-site/
};

export default nextConfig;
