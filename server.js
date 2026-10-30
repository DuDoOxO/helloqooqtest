const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data.json");
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return []; }
}
function save(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}
function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/health') return json(res, 200, { ok: true, v: '1032' });

  if (url.pathname === '/api/messages') {
    if (req.method === 'GET') return json(res, 200, load());
    if (req.method === 'POST') {
      let body;
      try { body = await readBody(req); } catch { return json(res, 400, { error: 'invalid json' }); }
      const name = String(body.name || '').trim().slice(0, 50);
      const text = String(body.text || '').trim().slice(0, 500);
      if (!name || !text) return json(res, 400, { error: 'name and text required' });
      const items = load();
      const item = { id: Date.now(), name, text, createdAt: new Date().toISOString() };
      items.unshift(item);
      save(items);
      return json(res, 201, item);
    }
    return json(res, 405, { error: 'method not allowed' });
  }

  const m = url.pathname.match(/^\/api\/messages\/(\d+)$/);
  if (m && req.method === 'DELETE') {
    const items = load().filter((i) => i.id !== Number(m[1]));
    save(items);
    return json(res, 200, { ok: true });
  }

  // static files
  const file = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, content) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
