import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://143letters.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '5mb' })); // allow photo URLs

// ── In-memory store (resets on redeploy — fine for free tier) ────────────────
// For persistence, swap with a free DB like Upstash Redis or Supabase later
const letters = new Map();

// Auto-delete letters older than 30 days to save memory
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function generateId() {
  return randomBytes(4).toString('hex'); // 8 char hex e.g. "a3f9c12b"
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', letters: letters.size, timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: '143 Letters API 💌' });
});

/**
 * POST /api/letters
 * Body: { message, password, photoUrl? }
 * Returns: { id } — short 8-char ID
 */
app.post('/api/letters', (req, res) => {
  const { message, password, photoUrl } = req.body;
  if (!message || !password) {
    return res.status(400).json({ error: 'message and password are required' });
  }

  const id = generateId();
  letters.set(id, {
    message,
    password,
    photoUrl: photoUrl || null,
    createdAt: Date.now(),
  });

  // Clean up expired letters
  for (const [key, val] of letters.entries()) {
    if (Date.now() - val.createdAt > TTL_MS) letters.delete(key);
  }

  res.json({ id });
});

/**
 * POST /api/letters/:id/unlock
 * Body: { password }
 * Returns: { message, photoUrl } on success, 401 on wrong password
 */
app.post('/api/letters/:id/unlock', (req, res) => {
  const letter = letters.get(req.params.id);
  if (!letter) return res.status(404).json({ error: 'Letter not found 💔' });

  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password is required' });

  if (letter.password.toLowerCase() !== password.toLowerCase()) {
    return res.status(401).json({ error: 'Wrong password 💔' });
  }

  res.json({ message: letter.message, photoUrl: letter.photoUrl });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  143 Letters API on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});
