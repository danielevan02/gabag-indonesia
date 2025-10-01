import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'www.google.com'},
      {protocol: 'https', hostname: 'res.cloudinary.com'},
    ]
  },
  // productionBrowserSourceMaps: false,
  // webpack: (config) => {
  //   config.optimization.minimize = false;
  //   return config;
  // },
};

export default nextConfig;
