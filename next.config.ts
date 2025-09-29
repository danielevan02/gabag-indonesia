import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    useCache: false
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'www.google.com'},
      {protocol: 'https', hostname: 'res.cloudinary.com'},
    ]
  }
};

export default nextConfig;
