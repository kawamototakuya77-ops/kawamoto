import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GAS (script.google.com) へのリクエストを許可
  generateBuildId: async () => `build-${Date.now()}`,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
