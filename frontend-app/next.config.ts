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
  }
};

export default nextConfig;
