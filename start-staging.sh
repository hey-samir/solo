#!/bin/bash

# Solo App Staging Server Manager
# This script manages the staging server process

# Configuration
SERVER_SCRIPT="stable-staging-server.js"
SERVER_PORT=5000
LOG_FILE="staging-server.log"

# Function to check if server is running
check_server() {
  if pgrep -f "node $SERVER_SCRIPT" > /dev/null; then
    return 0  # Running
  else
    return 1  # Not running
  fi
}

# Function to start the server
start_server() {
  echo "Starting staging server..."
  node $SERVER_SCRIPT > $LOG_FILE 2>&1 &
  sleep 2
  
  if check_server; then
    echo "Server started successfully on port $SERVER_PORT"
    return 0
  else
    echo "Server failed to start. Check $LOG_FILE for details."
    return 1
  fi
}

# Function to stop the server
stop_server() {
  echo "Stopping staging server..."
  pkill -f "node $SERVER_SCRIPT" || true
  sleep 1
  
  if ! check_server; then
    echo "Server stopped successfully"
    return 0
  else
    echo "Failed to stop server. Trying force kill..."
    pkill -9 -f "node $SERVER_SCRIPT" || true
    return 1
  fi
}

# Function to restart the server
restart_server() {
  stop_server
  start_server
}

# Function to check server status
status_server() {
  if check_server; then
    echo "Server is running on port $SERVER_PORT"
    ps aux | grep "node $SERVER_SCRIPT" | grep -v grep
    echo "Recent log entries:"
    tail -n 5 $LOG_FILE
    return 0
  else
    echo "Server is not running"
    return 1
  fi
}

# Main script logic
case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    restart_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0
