import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
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
