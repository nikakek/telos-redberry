import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'momentum.redberryinternship.ge',
        pathname: '/storage/employee-avatars/**',
      },
    ],
  },
};

export default nextConfig;
