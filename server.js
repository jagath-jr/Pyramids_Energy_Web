const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const DEFAULT_FILE = path.join(DATA_DIR, 'content.default.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const UPLOAD_DIR = path.join(ROOT, 'uploads');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const sessions = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function ensureStorage() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(CONTENT_FILE) && fs.existsSync(DEFAULT_FILE)) {
    fs.copyFileSync(DEFAULT_FILE, CONTENT_FILE);
  }
  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
  }
}

function safeReadJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, chunk) => {
    const [k, ...rest] = chunk.trim().split('=');
    if (!k) return acc;
    acc[k] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function verifyPassword(input) {
  if (ADMIN_PASSWORD_HASH) return hash(input) === ADMIN_PASSWORD_HASH;
  return input === ADMIN_PASSWORD;
}

function createSession(username) {
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, {
    username,
    createdAt: Date.now()
  });
  return sid;
}

function getSession(req) {
  const sid = parseCookies(req).sid;
  if (!sid) return null;
  return sessions.get(sid) || null;
}

function isAuthenticated(req) {
  return Boolean(getSession(req));
}

function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

function normalizeFilePath(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const cleaned = path.normalize(decoded).replace(/^\/+/, '');
  return cleaned;
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

function pushHistory(currentContent) {
  const history = safeReadJson(HISTORY_FILE, []);
  history.push({
    timestamp: new Date().toISOString(),
    content: currentContent
  });
  while (history.length > 20) history.shift();
  writeJson(HISTORY_FILE, history);
}

function handleApi(req, res, pathname) {
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    return readBody(req)
      .then(raw => {
        const body = JSON.parse(raw || '{}');
        if (body.username !== ADMIN_USERNAME || !verifyPassword(body.password || '')) {
          return sendJson(res, 401, { error: 'Invalid credentials' });
        }
        const sid = createSession(body.username);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `sid=${sid}; HttpOnly; Path=/; SameSite=Strict`
        });
        res.end(JSON.stringify({ ok: true }));
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid request' }));
  }

  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    const sid = parseCookies(req).sid;
    if (sid) sessions.delete(sid);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (pathname === '/api/admin/session' && req.method === 'GET') {
    return sendJson(res, 200, { authenticated: isAuthenticated(req) });
  }

  if (pathname === '/api/content' && req.method === 'GET') {
    return sendJson(res, 200, safeReadJson(CONTENT_FILE, {}));
  }


  if (pathname === '/api/admin/upload' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    return readBody(req)
      .then(raw => {
        const body = JSON.parse(raw || '{}');
        const filename = String(body.filename || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
        const dataUrl = String(body.dataUrl || '');
        const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) return sendJson(res, 400, { error: 'Invalid upload payload' });
        const ext = path.extname(filename) || '.bin';
        const stored = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, stored), Buffer.from(match[2], 'base64'));
        sendJson(res, 200, { ok: true, path: `/uploads/${stored}` });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid request' }));
  }

  if (pathname === '/api/admin/content' && req.method === 'GET') {
    if (!requireAuth(req, res)) return;
    return sendJson(res, 200, safeReadJson(CONTENT_FILE, {}));
  }

  if (pathname === '/api/admin/content' && req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    return readBody(req)
      .then(raw => {
        const nextContent = JSON.parse(raw || '{}');
        const current = safeReadJson(CONTENT_FILE, {});
        pushHistory(current);
        writeJson(CONTENT_FILE, nextContent);
        sendJson(res, 200, { ok: true });
      })
      .catch(() => sendJson(res, 400, { error: 'Invalid JSON body' }));
  }

  if (pathname === '/api/admin/content/default' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    const current = safeReadJson(CONTENT_FILE, {});
    pushHistory(current);
    const defaults = safeReadJson(DEFAULT_FILE, {});
    writeJson(CONTENT_FILE, defaults);
    return sendJson(res, 200, { ok: true, content: defaults });
  }

  if (pathname === '/api/admin/content/undo' && req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    const history = safeReadJson(HISTORY_FILE, []);
    if (!history.length) return sendJson(res, 400, { error: 'No undo history found' });
    const previous = history.pop();
    writeJson(HISTORY_FILE, history);
    writeJson(CONTENT_FILE, previous.content);
    return sendJson(res, 200, { ok: true, content: previous.content, restoredAt: previous.timestamp });
  }

  sendJson(res, 404, { error: 'Route not found' });
}

function route(req, res) {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsed.pathname;

  if (pathname.startsWith('/api/')) {
    return handleApi(req, res, pathname);
  }

  if (pathname === '/admin') {
    return serveFile(res, path.join(ROOT, 'admin', 'index.html'));
  }

  if (pathname.startsWith('/admin/')) {
    const clean = normalizeFilePath(pathname.replace('/admin/', ''));
    return serveFile(res, path.join(ROOT, 'admin', clean));
  }

  if (pathname.startsWith('/uploads/')) {
    const clean = normalizeFilePath(pathname.replace('/uploads/', ''));
    return serveFile(res, path.join(UPLOAD_DIR, clean));
  }

  const requested = pathname === '/' ? 'index.html' : normalizeFilePath(pathname);
  return serveFile(res, path.join(ROOT, requested));
}

ensureStorage();

http.createServer(route).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
