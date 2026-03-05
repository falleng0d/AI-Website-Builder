import type { NextConfig } from "next";
import { env } from "./lib/env";

const hostname = env["HOSTNAME"];
const allowedDevOrigins = ["localhost:3000"];

if (hostname) {
  allowedDevOrigins.push(`${hostname}`);
}

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
  allowedDevOrigins: allowedDevOrigins,
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
