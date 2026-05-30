import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Redis } from '@upstash/redis';
import { randomBytes } from 'crypto';

const app = express();
const PORT = process.env.PORT || 4000;

// ── Redis ─────────────────────────────────────────────────────────────────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

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

app.use(express.json({ limit: '5mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', redis: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ status: 'error', redis: e.message });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: '143 Letters API 💌' });
});

/**
 * POST /api/letters
 * Body: { message, password, photoUrl? }
 * Returns: { id }
 */
app.post('/api/letters', async (req, res) => {
  const { message, password, photoUrl } = req.body;
  if (!message || !password) {
    return res.status(400).json({ error: 'message and password are required' });
  }

  try {
    const id = randomBytes(4).toString('hex');
    await redis.set(
      `letter:${id}`,
      JSON.stringify({ message, password, photoUrl: photoUrl || null }),
      { ex: TTL_SECONDS }
    );
    res.json({ id });
  } catch (e) {
    console.error('Redis set error:', e);
    res.status(500).json({ error: 'Failed to save letter' });
  }
});

/**
 * POST /api/letters/:id/unlock
 * Body: { password }
 * Returns: { message, photoUrl } or 401
 */
app.post('/api/letters/:id/unlock', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password is required' });

  try {
    const raw = await redis.get(`letter:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: 'Letter not found 💔' });

    const letter = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (letter.password.toLowerCase() !== password.toLowerCase()) {
      return res.status(401).json({ error: 'Wrong password 💔' });
    }

    res.json({ message: letter.message, photoUrl: letter.photoUrl });
  } catch (e) {
    console.error('Redis get error:', e);
    res.status(500).json({ error: 'Failed to retrieve letter' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  143 Letters API on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});
