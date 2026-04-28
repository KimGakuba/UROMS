# UROMS Deployment Guide

## Architecture
- **Frontend** → Vercel (free)
- **Backend** → Render (free)

---

## Step 1 — Push to GitHub

```bash
cd /home/ngabonziza-kim-gakuba/Documents/UROMS
git init
git add .
git commit -m "Initial UROMS commit"
# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/uroms.git
git push -u origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to https://render.com → Sign up / Log in
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name:** uroms-api
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   - `JWT_SECRET` → click "Generate" for a random value
   - `NODE_ENV` → `production`
6. Click **Create Web Service**
7. Wait ~2 min → copy your URL e.g. `https://uroms-api.onrender.com`

---

## Step 3 — Update Frontend API URL

Edit `frontend/.env.production`:
```
VITE_API_URL=https://uroms-api.onrender.com/api
```

Commit and push:
```bash
git add frontend/.env.production
git commit -m "Set production API URL"
git push
```

---

## Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up / Log in
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - `VITE_API_URL` → `https://uroms-api.onrender.com/api`
6. Click **Deploy**
7. Your app is live at `https://uroms.vercel.app` (or similar)

---

## Step 5 — Update Backend CORS

After Vercel gives you a URL, go to Render dashboard:
- Add env var: `FRONTEND_URL` → `https://your-app.vercel.app`
- Render will auto-redeploy

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001

## Demo Login
- admin@uroms.ac / admin123
