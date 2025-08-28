import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  
  // For GitHub Pages deployment (if your repo is not at root)
  // Replace 'your-repo-name' with your actual repository name
  // basePath: '/fhir-server-performance-benchmark',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Handle trailing slashes
  trailingSlash: true,
  
  // Disable server-side features
  // This ensures the app works as a pure SPA
  experimental: {
    // Ensure client-side navigation works properly
  }
};

export default nextConfig;
