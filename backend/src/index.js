import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://143letters.vercel.app',   // production Vercel frontend
  'http://localhost:3000',           // local dev
  process.env.FRONTEND_URL,         // any extra override via env var
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Render health checks, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Health check — Render pings this to confirm the service is alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: '143 Letters API is running 💌' });
});

/**
 * POST /api/encode
 * Body: { message: string, password: string }
 * Returns: { token: string }  — base64 encoded payload for the share URL
 */
app.post('/api/encode', (req, res) => {
  const { message, password } = req.body;

  if (!message || !password) {
    return res.status(400).json({ error: 'message and password are required' });
  }

  try {
    const payload = JSON.stringify({ message, password });
    const token = Buffer.from(unescape(encodeURIComponent(payload))).toString('base64');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to encode letter' });
  }
});

/**
 * POST /api/decode
 * Body: { token: string, password: string }
 * Returns: { message: string } on success, 401 on wrong password
 */
app.post('/api/decode', (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'token and password are required' });
  }

  try {
    const decoded = decodeURIComponent(escape(Buffer.from(token, 'base64').toString('utf8')));
    const data = JSON.parse(decoded);

    if (!data.message || !data.password) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    if (data.password.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ error: 'Wrong password 💔' });
    }

    res.json({ message: data.message });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or corrupted token' });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  143 Letters API listening on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});
