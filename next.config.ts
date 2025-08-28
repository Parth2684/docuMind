import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don’t try to bundle .node binaries
      config.externals.push("onnxruntime-node", "sharp");
    }

    config.resolve.alias["sharp"] = path.resolve("./sharp-stub.js")
    return config;
  },
};

export default nextConfig;
