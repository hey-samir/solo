#!/usr/bin/env python3
"""
Next.js Proxy Server for Solo App
This server forwards requests to a Next.js server and handles static files
"""
import os
import sys
import json
import mimetypes
import http.server
import socketserver
import subprocess
import threading
import time
import urllib.request
import urllib.error
from urllib.parse import urlparse, parse_qs

PORT = 5000
NEXT_SERVER_PORT = 3000  # Internal Next.js server port
STATIC_DIR = os.path.join(os.getcwd(), 'public')

# Ensure proper MIME types are registered
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/json', '.json')

# Global flag to track if Next.js server is ready
next_server_ready = False

class NextJsProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)
    
    def do_GET(self):
        if not next_server_ready:
            self.send_response(503)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Service Unavailable</h1><p>The Next.js server is starting up. Please try again in a moment.</p></body></html>")
            return
            
        # Try to proxy to Next.js server
        try:
            url = f"http://localhost:{NEXT_SERVER_PORT}{self.path}"
            req = urllib.request.Request(url, headers=dict(self.headers))
            
            with urllib.request.urlopen(req, timeout=10) as response:
                self.send_response(response.status)
                
                # Forward response headers
                for header in response.headers:
                    if header.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(header, response.headers[header])
                
                self.end_headers()
                
                # Forward response body
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            self.send_error(500, f"Error proxying request: {str(e)}")
    
    def do_POST(self):
        self.do_proxy_request('POST')
        
    def do_PUT(self):
        self.do_proxy_request('PUT')
        
    def do_DELETE(self):
        self.do_proxy_request('DELETE')
        
    def do_proxy_request(self, method):
        if not next_server_ready:
            self.send_response(503)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<html><body><h1>Service Unavailable</h1><p>The Next.js server is starting up. Please try again in a moment.</p></body></html>")
            return
            
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None
        
        try:
            url = f"http://localhost:{NEXT_SERVER_PORT}{self.path}"
            req = urllib.request.Request(url, data=body, method=method)
            
            # Copy request headers
            for header in self.headers:
                if header.lower() not in ('host', 'content-length'):
                    req.add_header(header, self.headers[header])
            
            with urllib.request.urlopen(req, timeout=10) as response:
                self.send_response(response.status)
                
                # Forward response headers
                for header in response.headers:
                    if header.lower() not in ('transfer-encoding', 'connection'):
                        self.send_header(header, response.headers[header])
                
                self.end_headers()
                
                # Forward response body
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(e.read())
            
        except Exception as e:
            self.send_error(500, f"Error proxying request: {str(e)}")
    
    def log_message(self, format, *args):
        """Custom logging for the server"""
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")

def start_next_server():
    """Start the Next.js server as a child process"""
    global next_server_ready
    
    # Environment setup for Next.js
    env = os.environ.copy()
    env['PORT'] = str(NEXT_SERVER_PORT)
    env['NODE_ENV'] = 'development'
    
    # Start Next.js with the internal port
    cmd = ["npx", "next", "dev", "-p", str(NEXT_SERVER_PORT)]
    
    print(f"Starting Next.js server on internal port {NEXT_SERVER_PORT}...")
    try:
        process = subprocess.Popen(
            cmd, 
            env=env,
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        # Monitor output for server ready message
        for line in iter(process.stdout.readline, ''):
            print(f"[Next.js] {line.strip()}")
            if "ready" in line.lower() and "started" in line.lower():
                next_server_ready = True
                print(f"✅ Next.js server ready on internal port {NEXT_SERVER_PORT}")
        
        # If we get here, the process has terminated
        print("❌ Next.js server process ended unexpectedly")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Failed to start Next.js server: {str(e)}")
        sys.exit(1)

def run_server():
    """Start the HTTP proxy server"""
    # Start Next.js in a separate thread
    next_thread = threading.Thread(target=start_next_server)
    next_thread.daemon = True
    next_thread.start()
    
    # Give Next.js some time to start up
    print("Waiting for Next.js server to initialize...")
    
    # Start the proxy server
    try:
        handler = NextJsProxyHandler
        with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
            print(f"🚀 Proxy server running at http://0.0.0.0:{PORT}")
            print(f"Forwarding to Next.js on port {NEXT_SERVER_PORT}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server shutting down...")
    except Exception as e:
        print(f"Server error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("Starting Solo App Staging Server...")
    run_server()
