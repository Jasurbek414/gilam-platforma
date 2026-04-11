import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external domain tunnel proxy to load without cross-origin issues
  serverExternalPackages: [],
  async redirects() {
    return [
      {
        source: '/operators',
        destination: '/operator/login',
        permanent: false,
      },
      {
        source: '/operators/:path*',
        destination: '/operator/:path*',
        permanent: false,
      }
    ];
  },
  async rewrites() {
    // using 127.0.0.1 instead of localhost avoids Node IPv6 resolving bugs (ECONNREFUSED)
    const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${BACKEND_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
