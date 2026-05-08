# 💌 143 Letters

A romantic, password-protected secret letter app. Write a heartfelt message, lock it with a password, and share a link. The recipient unlocks it, watches the envelope open, and reads the letter as it types itself out — with optional photo support.

**Live:** [143letters.vercel.app](https://143letters.vercel.app)

---

## ✨ Features

- **Write & lock** — compose a letter and protect it with a custom password
- **Photo attachment** — add a photo (uploaded via imgbb, keeps the share URL short)
- **Shareable link** — the entire letter is encoded in the URL hash, no database needed
- **Password gate** — recipient enters the password to unlock
- **Envelope animation** — animated flap open with wax seal + blue rose decorations
- **Typewriter effect** — letter types itself out on parchment paper with rose corner art
- **Seal the memory** — ends with a romantic final scene

---

## 🗂 Project Structure

```
/
├── fend/          # React + Vite frontend  →  Vercel
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateLetter.tsx    # Write message + upload photo
│   │   │   ├── ShareLetter.tsx     # Copy shareable link
│   │   │   ├── PasswordGate.tsx    # Password unlock screen
│   │   │   ├── EnvelopeView.tsx    # Animated envelope with wax seal
│   │   │   ├── LetterView.tsx      # Typewriter letter on parchment
│   │   │   ├── FinalScene.tsx      # Ending quote
│   │   │   ├── RoseCorner.tsx      # SVG blue rose decoration
│   │   │   ├── WaxSeal.tsx         # SVG wax seal stamp
│   │   │   └── BackgroundEffects.tsx # Floating hearts canvas
│   │   ├── App.tsx
│   │   └── styles.css
│   ├── vercel.json
│   └── .env.example
│
└── backend/       # Express API  →  Render
    ├── src/
    │   └── index.js    # /health, /api/encode, /api/decode
    └── .env.example
```

---

## 🚀 Local Development

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

---

## 🌐 Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** → `fend`
3. Add env var: `VITE_API_URL=https://letter-0yl6.onrender.com`

### Backend → Render
- **Root Directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Live at:** `https://letter-0yl6.onrender.com`

> Note: Render free tier spins down after inactivity — first request after idle may take ~30s.

---

## 🔑 Environment Variables

**`fend/.env`**
```
VITE_API_URL=http://localhost:4000
```

**`backend/.env`**
```
PORT=4000
FRONTEND_URL=https://143letters.vercel.app
```

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Styling | Custom CSS, Playfair Display, Caveat, Poppins |
| Backend | Node.js, Express |
| Image hosting | [imgbb](https://imgbb.com) free API |
| Frontend deploy | Vercel |
| Backend deploy | Render |

---

## 📸 How the Photo Feature Works

1. User picks a photo → compressed client-side (max 1024px, JPEG 0.8)
2. Uploaded directly to imgbb API → returns a short URL
3. Only the URL is encoded into the letter payload — share link stays short
4. Recipient sees the photo fade in below the letter text after typing finishes
