import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    // Use CWD to avoid ESM __dirname issues in Next config.
    includePaths: [path.resolve(process.cwd(), "src")],
    // Newer Sass APIs use loadPaths instead of includePaths.
    loadPaths: [path.resolve(process.cwd(), "src")],
  },
};

export default nextConfig;
