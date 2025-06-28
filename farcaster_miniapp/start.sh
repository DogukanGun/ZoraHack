#!/bin/bash

# Exit on error
set -e

# Navigate to the app directory
cd "$(dirname "$0")"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application
echo "Building the application..."
npm run build

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 delete zora-app 2>/dev/null || true
pm2 start npm --name "zora-app" -- start

# Save PM2 process list to ensure it restarts on server reboot
pm2 save

echo "Application is now running with PM2!"
echo "To check status: pm2 status"
echo "To view logs: pm2 logs zora-app"
echo "To stop: pm2 stop zora-app" 