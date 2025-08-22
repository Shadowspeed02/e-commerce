#!/bin/bash

echo "Build Verification Script"
echo "========================"

# Function to check directory
check_directory() {
    if [ -d "$1" ]; then
        echo "✓ Directory exists: $1"
        echo "Contents:"
        ls -la "$1"
    else
        echo "✗ Directory missing: $1"
        return 1
    fi
}

# Check client build
echo "\nChecking client build..."
check_directory "client/build"

# Check server build
echo "\nChecking server build..."
check_directory "server/build"

# Check for critical files
if [ -f "server/build/index.html" ]; then
    echo "✓ index.html found in server/build"
else
    echo "✗ index.html missing from server/build"
    exit 1
fi
