#!/bin/bash
set -e

# Display versions
node --version
npm --version

# Set Node.js memory limit to optimize for resource-constrained environments
export NODE_OPTIONS="--max-old-space-size=512"

# Install dependencies without verbose logging and without cleaning
echo "Installing dependencies..."
npm ci --prefer-offline --no-audit --progress=false

# Run build with CI=false to ignore warnings
echo "Building production bundle..."
CI=false npm run build

# If build succeeds, display success message
echo "Build completed successfully!"
