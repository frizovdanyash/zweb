#!/usr/bin/env node
/**
 * zWeb — минимальный сервер статики.
 *
 *   node serve.js             → http://localhost:3000
 *   PORT=8080 node serve.js   → http://localhost:8080
 *
 * Ничего собирать не нужно: всё, что лежит в public/, уже готово к работе.
 * Для продакшена предпочтительнее Dockerfile + docker/nginx.conf (там есть
 * кеширование, gzip и healthcheck), но и этот файл годится для VPS/панели.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, 'public');
const PORT = +(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.tgs': 'application/gzip',
  '.bin': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4'
};

const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.xml', '.svg', '.wasm', '.bin']);
const IMMUTABLE = /-[A-Za-z0-9_-]{8}\.(?:js|css|woff2?)$|\.(?:png|jpe?g|webp|avif|gif|ico|tgs|wasm|bin)$/;

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function withCompression(req, res, body, ext) {
  const accept = String(req.headers['accept-encoding'] || '');
  if(!COMPRESSIBLE.has(ext) || body.length < 1024) return send(res, 200, body, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': body.length,
    ...cacheHeaders(ext)
  });

  if(/\bbr\b/.test(accept)) {
    const compressed = zlib.brotliCompressSync(body, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length
      }
    });
    return send(res, 200, compressed, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Encoding': 'br',
      'Content-Length': compressed.length,
      Vary: 'Accept-Encoding',
      ...cacheHeaders(ext)
    });
  }

  if(/\bgzip\b/.test(accept)) {
    const compressed = zlib.gzipSync(body, {level: 6});
    return send(res, 200, compressed, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Encoding': 'gzip',
      'Content-Length': compressed.length,
      Vary: 'Accept-Encoding',
      ...cacheHeaders(ext)
    });
  }

  return send(res, 200, body, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': body.length,
    ...cacheHeaders(ext)
  });
}

function cacheHeaders(ext) {
  const name = ext;
  return {
    'Cache-Control': name === '.html' ? 'no-cache' : IMMUTABLE.test(name) ? 'public, max-age=2592000, immutable' : 'public, max-age=3600'
  };
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const safeUrl = path.normalize(url).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(ROOT, safeUrl);

  if(!filePath.startsWith(ROOT)) {
    return send(res, 403, 'Forbidden', {'Content-Type': 'text/plain'});
  }

  fs.stat(filePath, (err, stat) => {
    if(err || stat.isDirectory()) {
      // SPA: неизвестный путь отдаём как index.html
      filePath = path.join(ROOT, 'index.html');
      return fs.readFile(filePath, (indexErr, body) => {
        if(indexErr) return send(res, 404, 'Not found', {'Content-Type': 'text/plain'});
        send(res, 200, body, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': body.length,
          'Cache-Control': 'no-cache'
        });
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (readErr, body) => {
      if(readErr) return send(res, 404, 'Not found', {'Content-Type': 'text/plain'});
      withCompression(req, res, body, ext);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`zWeb запущен: http://localhost:${PORT}`);
  console.log(`Раздаётся папка: ${ROOT}`);
});
