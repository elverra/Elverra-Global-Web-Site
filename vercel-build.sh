#!/bin/bash
set -e

echo "--- Installing dependencies ---"
pnpm install --frozen-lockfile

echo "--- Building client ---"
NODE_ENV=production pnpm vite build

echo "--- Building server ---"
pnpm esbuild server/index.ts \
  --bundle \
  --platform=node \
  --packages=external \
  --format=esm \
  --outfile=dist/server/index.js

# Copy shared files
mkdir -p dist/shared
cp -r shared/* dist/shared/

# Copy migrations
mkdir -p dist/migrations
cp -r migrations/* dist/migrations/

echo "--- Build complete ---"
echo "Vercel build completed successfully"
