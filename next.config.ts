import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'www.google.com'},
      {protocol: 'https', hostname: 'files.edgestore.dev'},
      {protocol: 'https', hostname: 'res.cloudinary.com'},
    ]
  }
};

export default nextConfig;
