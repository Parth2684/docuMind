import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don’t try to bundle .node binaries
      config.externals.push("onnxruntime-node");
    }
    return config;
  },
};

export default nextConfig;
