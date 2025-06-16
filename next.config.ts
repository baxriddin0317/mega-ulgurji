import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images : {
    domains: ['picsum.photos', 'firebasestorage.googleapis.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  }
};

export default nextConfig;
