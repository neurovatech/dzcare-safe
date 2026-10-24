import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  // Small self-contained server bundle (.next/standalone) — less memory, faster boot
  output: "standalone",
  // gzip in Node costs CPU on every response. Set DISABLE_NEXT_COMPRESSION=1 when
  // nginx / Cloudflare compresses instead (see deploy/nginx.conf.example).
  compress: process.env.DISABLE_NEXT_COMPRESSION !== "1",
  // API data: refreshed in the background every 5 min, never older than 1 hour.
  // stale must stay >= 300s, otherwise Next keeps the data out of the prefetched
  // App Shell ("URL data outside of Suspense" insight). POST /api/revalidate
  // still clears it instantly.
  cacheLife: {
    api: { stale: 300, revalidate: 300, expire: 3600 },
  },
  images: {
    // WebP only: AVIF encoding costs several times more CPU per image on the server
    formats: ["image/webp"],
    qualities: [75],
    // Optimized images are kept on disk for 30 days instead of re-encoding every 4 hours
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Fewer size variants → fewer images to encode and cache
    deviceSizes: [384, 640, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 176, 256],
    remotePatterns: [new URL("https://dazzle.sgp1.cdn.digitaloceanspaces.com/**")],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
