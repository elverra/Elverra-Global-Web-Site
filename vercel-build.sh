#!/bin/bash
set -e

# Install dependencies
pnpm install --frozen-lockfile

# Build the client
cd client
pnpm install
pnpm run build
cd ..

# Build the server
pnpm run build

echo "Build completed successfully"
