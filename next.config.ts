import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  output: isVercel ? "export" : "standalone",
  outputFileTracingRoot: appRoot,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai"],
};

export default nextConfig;
