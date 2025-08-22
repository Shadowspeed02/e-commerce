#!/bin/bash

# Print working directory
echo "Current directory: $(pwd)"

# Check if client/build exists
if [ -d "client/build" ]; then
    echo "client/build directory exists"
    ls -la client/build
else
    echo "Error: client/build directory not found"
fi

# Check if server/build exists
if [ -d "server/build" ]; then
    echo "server/build directory exists"
    ls -la server/build
else
    echo "Error: server/build directory not found"
fi

# Check for index.html
if [ -f "server/build/index.html" ]; then
    echo "index.html found in server/build"
else
    echo "Error: index.html not found in server/build"
fi
