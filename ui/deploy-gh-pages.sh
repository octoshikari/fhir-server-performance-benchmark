#!/bin/bash

# Build script for GitHub Pages deployment
# This script builds the Next.js app with the correct base path for GitHub Pages

echo "🚀 Building for GitHub Pages deployment..."

# Set the base path for GitHub Pages
export NEXT_PUBLIC_BASE_PATH="/fhir-server-performance-benchmark"

# Clean previous build
rm -rf out

# Build the application
echo "📦 Building Next.js application..."
npm run build

# Add .nojekyll file to prevent GitHub Pages from processing files
touch out/.nojekyll

# Create a 404.html that redirects to index
cp out/index.html out/404.html

echo "✅ Build complete! The 'out' directory is ready for deployment."
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Commit and push your changes to the main branch"
echo "2. The GitHub Actions workflow will automatically deploy to GitHub Pages"
echo ""
echo "Or manually deploy using gh-pages package:"
echo "npm install -g gh-pages"
echo "npx gh-pages -d out"