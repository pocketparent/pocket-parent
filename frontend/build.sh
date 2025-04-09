#!/bin/bash
set -e

# Display versions
node --version
npm --version

# Clean install
rm -rf node_modules
npm cache clean --force

# Install dependencies with more verbose output
echo "Installing dependencies..."
npm install --loglevel verbose

# Run build with CI=false to ignore warnings
echo "Building production bundle..."
CI=false npm run build

# If build succeeds, display success message
echo "Build completed successfully!"
