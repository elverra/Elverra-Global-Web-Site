#!/bin/bash
set -e

# Install dependencies
pnpm install

# Build the client
pnpm run build

# Create the dist directory if it doesn't exist
mkdir -p dist

# Copy server files to dist
cp -r server dist/
cp package*.json dist/
cp pnpm-lock.yaml dist/ 2>/dev/null || true
cp .env* dist/ 2>/dev/null || true

# Install production dependencies in dist
cd dist
pnpm install --production
cd ..
