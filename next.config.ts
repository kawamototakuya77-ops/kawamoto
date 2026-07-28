import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GAS (script.google.com) へのリクエストを許可
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
      },
    ];
  },
  // 外部画像ドメインの許可
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
