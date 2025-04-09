#!/bin/bash
# Build script for Hatchling frontend

# Print commands for debugging
set -x

# Clean up
rm -rf node_modules

# Clean npm cache
npm cache clean --force

# Install dependencies
npm install

# Build the application
npm run build
