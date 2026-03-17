import os
from flask import Flask, send_from_directory

# Serve files from the workspace root (GitHub Pages root)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

app = Flask(__name__, static_folder=ROOT, static_url_path='')


@app.route('/')
def index():
    return send_from_directory(ROOT, 'index.html')


@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory(ROOT, filename)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
