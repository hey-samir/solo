#!/bin/bash

# Git repository maintenance script
# This script performs essential maintenance tasks to prevent corruption

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Error: Not a git repository"
        exit 1
    fi
}

# Function to clean up interrupted operations
cleanup_interrupted() {
    # Remove index.lock if it exists (from interrupted operations)
    rm -f .git/index.lock
    
    # Remove commit-graph lock if it exists
    rm -f .git/objects/info/commit-graphs/commit-graph-chain.lock
    
    # Clean up any other lock files
    find .git -name "*.lock" -delete
    
    # Prune any disconnected objects
    git prune
    
    # Run garbage collection
    git gc --auto
}

# Function to create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_branch="backup-$timestamp"
    
    # Create a backup branch
    git branch "$backup_branch"
    echo "Created backup branch: $backup_branch"
}

# Function to verify repository health
verify_repo_health() {
    # Check for corruption
    git fsck --full
    
    # Verify all objects
    git fsck --strict
}

# Main execution
echo "Starting Git maintenance..."
check_git_repo
cleanup_interrupted
create_backup
verify_repo_health
echo "Git maintenance completed successfully"
