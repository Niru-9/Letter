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

### Frontend → Vercel
1. Import the repo in Vercel
2. Set **Root Directory** to `fend`
3. Add env var: `VITE_API_URL=https://<your-render-service>.onrender.com`

### Backend → Render
1. Create a new **Web Service** in Render
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env var: `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
