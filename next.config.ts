import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: false
})

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    useCache: true
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'www.google.com'}
    ]
  }
};

export default bundleAnalyzer(nextConfig);
