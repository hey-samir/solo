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
    echo "Cleaning up interrupted operations..."

    # Remove index.lock if it exists (from interrupted operations)
    if [ -f ".git/index.lock" ]; then
        rm -f .git/index.lock
        echo "Removed index.lock"
    fi

    # Remove commit-graph lock if it exists
    if [ -f ".git/objects/info/commit-graphs/commit-graph-chain.lock" ]; then
        rm -f .git/objects/info/commit-graphs/commit-graph-chain.lock
        echo "Removed commit-graph lock"
    fi

    # Clean up any other lock files
    find .git -name "*.lock" -type f -delete

    # Prune any disconnected objects
    git prune

    # Run garbage collection
    git gc --auto

    echo "Cleanup completed"
}

# Function to create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_branch="backup-$timestamp"

    echo "Creating backup..."
    # Create a backup branch
    git branch "$backup_branch"
    echo "Created backup branch: $backup_branch"

    # Create a backup of the entire .git directory
    if [ ! -d ".git/backups" ]; then
        mkdir -p .git/backups
    fi
    tar -czf ".git/backups/git-backup-$timestamp.tar.gz" .git/
    echo "Created .git directory backup: .git/backups/git-backup-$timestamp.tar.gz"
}

# Function to verify repository health
verify_repo_health() {
    echo "Verifying repository health..."

    # Check for corruption
    if ! git fsck --full; then
        echo "WARNING: Repository corruption detected"
        return 1
    fi

    # Verify all objects
    if ! git fsck --strict; then
        echo "WARNING: Repository strict verification failed"
        return 1
    fi

    # Check for dangling objects
    if [ -n "$(git fsck --lost-found)" ]; then
        echo "WARNING: Dangling objects found"
        git fsck --lost-found
    fi

    # Verify refs
    if ! git for-each-ref; then
        echo "WARNING: Reference verification failed"
        return 1
    fi

    echo "Repository health check completed successfully"
    return 0
}

# Function to repair common issues
repair_repo() {
    echo "Attempting repository repair..."

    # Rebuild index
    rm -f .git/index
    git reset --mixed HEAD || {
        echo "Failed to reset HEAD"
        return 1
    }

    # Clean and optimize repository
    git gc --aggressive --prune=now || {
        echo "Failed to run garbage collection"
        return 1
    }

    # Repack repository
    git repack -a -d --depth=250 --window=250 || {
        echo "Failed to repack repository"
        return 1
    }

    echo "Repository repair completed"
    return 0
}

# Main execution
echo "Starting Git maintenance..."
check_git_repo
cleanup_interrupted
create_backup

if ! verify_repo_health; then
    echo "Repository health check failed, attempting repair..."
    if ! repair_repo; then
        echo "ERROR: Repository repair failed"
        echo "Please consider restoring from the latest backup in .git/backups/"
        exit 1
    fi

    if ! verify_repo_health; then
        echo "ERROR: Repository still has issues after repair attempt"
        echo "Please consider restoring from the latest backup in .git/backups/"
        exit 1
    fi
fi

echo "Git maintenance completed successfully"