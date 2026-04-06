const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const API_TARGET = 'https://taiko.wiki/api/song';
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function serveStatic(reqPath, res) {
  const safePath = reqPath === '/' ? '/chart-builder.html' : reqPath;
  const filePath = path.join(ROOT, path.normalize(safePath));

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function proxySongs(res) {
  https.get(API_TARGET, (apiRes) => {
    let chunks = '';

    apiRes.on('data', (chunk) => {
      chunks += chunk;
    });

    apiRes.on('end', () => {
      send(res, apiRes.statusCode || 200, chunks, 'application/json; charset=utf-8');
    });
  }).on('error', (err) => {
    send(res, 502, JSON.stringify({ error: 'Upstream request failed', detail: err.message }), 'application/json; charset=utf-8');
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/song') {
    proxySongs(res);
    return;
  }

  serveStatic(req.url || '/', res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Open http://localhost:' + PORT + '/chart-builder.html');
});
