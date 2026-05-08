# Secret Letter

A romantic, password-protected letter sharing app.

## Structure

```
/
├── fend/       # React + Vite frontend  →  deploy to Vercel
└── backend/    # Express API            →  deploy to Render
```

## Local Development

**Frontend**
```bash
cd fend
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
```

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

## Deployment

### Frontend → Vercel (`https://143letters.vercel.app`)
1. Import the repo in Vercel, set **Root Directory** to `fend`
2. Add env var: `VITE_API_URL=https://letter-0yl6.onrender.com`
3. Redeploy

### Backend → Render (`https://letter-0yl6.onrender.com`)
1. Web Service connected to `Niru-9/Letter`, root dir `backend`
2. Build: `npm install` | Start: `npm start`
3. Env var: `FRONTEND_URL=https://143letters.vercel.app` (optional, already hardcoded)
