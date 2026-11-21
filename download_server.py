#!/usr/bin/env python3
"""Serve this folder. mp4 responses are downloads, not inline playback."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    def guess_type(self, path):
        if path.lower().endswith('.mp4'):
            return 'application/octet-stream'
        return super().guess_type(path)

    def end_headers(self):
        path = self.path.split('?', 1)[0]
        if path.lower().endswith('.mp4'):
            name = path.rsplit('/', 1)[-1]
            self.send_header('Content-Disposition', 'attachment; filename="%s"' % name)
        super().end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 8767), Handler).serve_forever()
