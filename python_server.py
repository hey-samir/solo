#!/usr/bin/env python3
"""
Simple HTTP Server for Solo App Staging Environment
"""
import os
import json
import mimetypes
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs

PORT = 5000
STATIC_DIR = os.path.join(os.getcwd(), 'dist/staging')

# Ensure proper MIME types are registered
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')

class SoloAppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)
    
    def do_GET(self):
        # Handle API endpoints
        if self.path.startswith('/api/feature-flags'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            flags = {
                "enableFeedback": True,
                "enableProfileEditing": True,
                "enableSoloMode": True,
                "enableWorkoutTracking": False,
                "enableCustomAvatars": False
            }
            
            self.wfile.write(json.dumps(flags).encode())
            return
        
        # Try to serve the requested file
        try:
            super().do_GET()
        except FileNotFoundError:
            # If file not found and not an API request, serve index.html for SPA routing
            if not self.path.startswith('/api/'):
                self.path = '/staging.html'
                try:
                    super().do_GET()
                except:
                    self.send_error(404, "File not found")
    
    def log_message(self, format, *args):
        """Custom logging for the server"""
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")

def run_server():
    """Start the HTTP server"""
    if not os.path.exists(STATIC_DIR):
        os.makedirs(STATIC_DIR, exist_ok=True)
        print(f"Created static directory: {STATIC_DIR}")
    
    if not os.path.exists(os.path.join(STATIC_DIR, 'staging.html')):
        print("Warning: staging.html not found in static directory")
    
    handler = SoloAppHandler
    with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
        print(f"Serving at http://0.0.0.0:{PORT}")
        print(f"Static files from: {STATIC_DIR}")
        httpd.serve_forever()

if __name__ == "__main__":
    print("Starting Solo App Staging Server...")
    run_server()
