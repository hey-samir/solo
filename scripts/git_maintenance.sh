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

# Function to create comprehensive backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir=".git/backups/$timestamp"
    local backup_branch="backup-$timestamp"
    local backup_log="$backup_dir/backup.log"
    local ignore_patterns=(
        "*token*"
        "*.key"
        "*.pem"
        "*.env"
        "*secret*"
        "*password*"
        "*credential*"
    )

    echo "Creating comprehensive backup..."

    # Create backup directory with proper permissions
    mkdir -p "$backup_dir"
    chmod 700 "$backup_dir"

    # Create backup log with proper permissions
    touch "$backup_log"
    chmod 600 "$backup_log"

    echo "Backup created at: $(date)" > "$backup_log"
    echo "Current branch: $(git branch --show-current)" >> "$backup_log"
    echo "Latest commit: $(git rev-parse HEAD)" >> "$backup_log"

    # Create a backup branch with timestamp
    git branch "$backup_branch"
    echo "Created backup branch: $backup_branch" | tee -a "$backup_log"

    # Create a filtered backup of the .git directory, excluding sensitive files
    echo "Creating filtered backup archive..."
    tar --exclude-vcs-ignores \
        $(printf -- "--exclude='%s' " "${ignore_patterns[@]}") \
        -czf "$backup_dir/git-backup.tar.gz" .git/
    echo "Created filtered .git directory backup: $backup_dir/git-backup.tar.gz" | tee -a "$backup_log"

    # Save current commit history
    git log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short > "$backup_dir/commit_history.txt"
    echo "Saved commit history to: $backup_dir/commit_history.txt" | tee -a "$backup_log"

    # Save list of unpushed commits
    git log --branches --not --remotes > "$backup_dir/unpushed_commits.txt"
    echo "Saved unpushed commits to: $backup_dir/unpushed_commits.txt" | tee -a "$backup_log"

    # Check for sensitive files before pushing
    echo "Checking for sensitive files before pushing..."
    local has_sensitive=false
    for pattern in "${ignore_patterns[@]}"; do
        if git ls-files | grep -i "$pattern"; then
            has_sensitive=true
            echo "WARNING: Found potentially sensitive files matching pattern: $pattern" | tee -a "$backup_log"
        fi
    done

    # If sensitive files are found, create a clean branch for pushing
    if [ "$has_sensitive" = true ]; then
        echo "Creating clean branch without sensitive files..." | tee -a "$backup_log"
        local clean_branch="clean-backup-$timestamp"
        git checkout -b "$clean_branch"

        # Remove sensitive files from the clean branch
        for pattern in "${ignore_patterns[@]}"; do
            git ls-files | grep -i "$pattern" | xargs -r git rm --cached
        done

        # Commit the changes
        git commit -m "Clean backup without sensitive files"

        # Try to push the clean branch
        if git remote | grep -q "origin"; then
            if git push origin "$clean_branch" --force; then
                echo "Successfully pushed clean backup branch to remote" | tee -a "$backup_log"
            else
                echo "Warning: Could not push clean backup branch to remote" | tee -a "$backup_log"
            fi
        fi

        # Return to original branch
        git checkout -
    else
        # Attempt to push backup branch to remote if possible and no sensitive files found
        if git remote | grep -q "origin"; then
            if git push origin "$backup_branch" --force; then
                echo "Successfully pushed backup branch to remote" | tee -a "$backup_log"
            else
                echo "Warning: Could not push backup branch to remote" | tee -a "$backup_log"
            fi
        fi
    fi

    # Clean up old backups (keep last 5)
    cd .git/backups && ls -t | tail -n +6 | xargs -r rm -rf

    echo "Comprehensive backup completed" | tee -a "$backup_log"
    echo "Backup location: $backup_dir"
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

    # Verify remote tracking
    if git remote | grep -q "origin"; then
        echo "Verifying remote tracking..."
        git remote show origin || {
            echo "WARNING: Remote verification failed"
            return 1
        }
    fi

    echo "Repository health check completed successfully"
    return 0
}

# Function to repair common issues
repair_repo() {
    echo "Attempting repository repair..."

    # Create pre-repair backup
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local repair_backup="repair-backup-$timestamp"
    git branch "$repair_backup"
    echo "Created pre-repair backup branch: $repair_backup"

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

    # Attempt to recover any lost commits
    git fsck --lost-found
    if [ -d ".git/lost-found" ]; then
        echo "Found lost commits in .git/lost-found"
        echo "Please check .git/lost-found/commit/ for any recoverable commits"
    fi

    echo "Repository repair completed"
    return 0
}

# Function to verify and push commits
verify_and_push() {
    echo "Verifying and pushing commits..."

    # Check if we have a remote
    if ! git remote | grep -q "origin"; then
        echo "No remote repository configured"
        return 1
    fi

    # Check for sensitive files
    local ignore_patterns=(
        "*token*"
        "*.key"
        "*.pem"
        "*.env"
        "*secret*"
        "*password*"
        "*credential*"
    )

    local has_sensitive=false
    for pattern in "${ignore_patterns[@]}"; do
        if git ls-files | grep -i "$pattern"; then
            has_sensitive=true
            echo "WARNING: Found potentially sensitive files matching pattern: $pattern"
        fi
    done

    if [ "$has_sensitive" = true ]; then
        echo "WARNING: Cannot push due to sensitive files in repository"
        echo "Please remove sensitive files before pushing"
        return 1
    fi

    # Get list of unpushed commits
    local unpushed=$(git log --branches --not --remotes)
    if [ -n "$unpushed" ]; then
        echo "Found unpushed commits, attempting to push..."

        # Try to push all branches
        if git push --all origin; then
            echo "Successfully pushed all branches"
        else
            echo "WARNING: Failed to push some refs"
            return 1
        fi
    else
        echo "No unpushed commits found"
    fi

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

# Attempt to push commits after health check
verify_and_push

echo "Git maintenance completed successfully"