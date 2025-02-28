#!/bin/bash

# Simple server starter using absolute paths
 simple-server.js > server.log 2>&1 &

# Wait a moment
sleep 2

# Check if server started
ps aux | grep "simple-server.js" | grep -v grep
echo "Server started on port 5000"
