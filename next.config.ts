import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // no custom webpack changes for now
  
  // Disable caching for admin routes to prevent "Access Denied" flash
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
