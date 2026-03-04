import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: "/",
        headers: [
          {
            key: "X-Tracking-Id",
            value: Math.random().toString(36).substring(7),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
