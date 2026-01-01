import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Cloudflare Pages deployment with SSR support
  images: {
    unoptimized: true, // Cloudflare Images can handle optimization
  },
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi'],
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
