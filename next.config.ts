import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
