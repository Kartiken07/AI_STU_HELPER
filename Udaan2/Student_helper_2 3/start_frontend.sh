#!/bin/bash
# Udaan Frontend Startup Script

echo "=== Starting Udaan Frontend ==="

cd "$(dirname "$0")/Front-end/my-app"

# Install dependencies
echo "Installing npm packages..."
npm install

# Start dev server
echo "Starting Vite dev server on http://localhost:5173"
npm run dev
