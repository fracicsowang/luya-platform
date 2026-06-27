import type { NextConfig } from "next";

// For GitHub Pages: static export under /<repo>. Set NEXT_PUBLIC_BASE_PATH at build
// time (e.g. "/luya-platform"). In dev it stays empty so the app serves at root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
