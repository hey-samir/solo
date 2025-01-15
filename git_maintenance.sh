#!/bin/bash

# Git repository maintenance script
# This script performs routine maintenance and health checks on the Git repository

echo "Starting Git repository maintenance..."

# Remove any temporary .git-rewrite directories if they exist
if [ -d ".git-rewrite" ]; then
    echo "Found interrupted rewrite operation, cleaning up..."
    rm -rf .git-rewrite/
fi

# Clean up and optimize the repository
echo "Performing repository optimization..."
git gc --aggressive --prune=now

# Expire old reflog entries
echo "Cleaning up reflog..."
git reflog expire --expire=now --all

# Repack the repository
echo "Repacking repository..."
git repack -ad

# Remove unreachable objects
echo "Removing unreachable objects..."
git prune

# Verify repository health
echo "Verifying repository health..."
git fsck --full

echo "Git maintenance completed."
