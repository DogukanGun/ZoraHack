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

# Install dependencies
echo "Installing dependencies..."
npm install
npm install inquirer # Required for build script
npm install @neynar/nodejs-sdk # Required for Neynar API integration

# Build the application
echo "Building the application..."
npm run build || {
    echo "Build failed. Trying to fix common issues..."
    
    # Check for common issues and fix them
    if ! grep -q "inquirer" package.json; then
        echo "Adding inquirer to dependencies..."
        npm install --save inquirer
    fi
    
    if ! grep -q "@neynar/nodejs-sdk" package.json; then
        echo "Adding @neynar/nodejs-sdk to dependencies..."
        npm install --save @neynar/nodejs-sdk
    fi
    
    # Try building again
    npm run build
}

# If build still fails, exit
if [ $? -ne 0 ]; then
    echo "Build failed after attempted fixes. Please check the error messages above."
    exit 1
fi

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