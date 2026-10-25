#!/usr/bin/env python3
"""Static server for local development with caching disabled.

Usage: python3 dev_server.py [port]   (default 8642)
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # keep the console quiet


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
    print(f'Serving on http://localhost:{port} (no-cache)')
    HTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
