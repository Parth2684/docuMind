import type { NextConfig } from "next";
import path from "path";
import os from "os"

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don’t try to bundle .node binaries
      config.externals.push("onnxruntime-node", "sharp");
    }

    const threads = os.cpus().length
    config.parallelism = threads
    config.resolve.alias["sharp"] = path.resolve("./sharp-stub.js")
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, // skips ESLint during next build
  }
};

export default nextConfig;
