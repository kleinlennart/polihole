import type { NextConfig } from "next";

// GitHub Pages project page: https://kleinlennart.github.io/polihole/
// Override with BASE_PATH="" for a local or root-hosted build.
const basePath = process.env.BASE_PATH ?? "/polihole";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // Hand-written URLs (service worker, manifest fields) don't get basePath
  // applied automatically, so the value is exposed to the client too.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
