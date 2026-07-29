# Deploy SAMSUC Portfolio (get a public link)

You need **two** things online:
1. **Backend API** (contact form, admin, analytics, CMS)
2. **Frontend** (the website) — can be served by the same backend

## Option A — Easiest: one service on Render (recommended)

1. Create a free account at https://render.com
2. Push this `portfolio` folder to a GitHub repo
3. On Render → **New → Web Service** → connect the repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance:** Free
5. Environment variables (Render → Environment):

```
NODE_ENV=production
JWT_SECRET=paste-a-long-random-string-here
JWT_EXPIRES=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=samsuc34@gmail.com
FRONTEND_URL=https://YOUR-SERVICE.onrender.com
```

6. After deploy, open:
   `https://YOUR-SERVICE.onrender.com`

7. Create admin user (Render Shell or locally pointing to production data is harder — run once locally then upload `data/users.json`, or add a one-time setup):

```bash
# Locally after cloning, with same JWT_SECRET:
cd backend
npm install
node src/scripts/createAdmin.js samsuc34@gmail.com "YourStrongPassword" "Samuel Success"
# Then copy backend/data/users.json into the server (or use a persistent disk on Render)
```

**Tip:** On Render free tier, add a **Persistent Disk** mounted at `/opt/render/project/src/data` so messages and analytics survive restarts. Or change DATA_DIR to that path.

### Serving the frontend from the same server

Your `server.js` already serves the parent folder as static files.  
On Render, set **Root Directory** to the **portfolio** folder (not only backend) and:

- Build: `cd backend && npm install`
- Start: `node backend/src/server.js`

Or keep root as repo root and adjust paths.

## Option B — Frontend on Vercel + Backend on Render

1. Deploy backend on Render as above → get `https://samsuc-api.onrender.com`
2. Deploy frontend on Vercel (import same repo, root = portfolio, ignore backend)
3. In frontend, set API base URL if needed (currently relative `/api/...` — only works same origin)

For split hosts you must change fetch URLs to the Render API domain and set CORS `FRONTEND_URL`.

## Gmail App Password (for contact emails)

1. Google Account → Security → 2-Step Verification ON  
2. App passwords → generate one for Mail  
3. Use that as `EMAIL_PASS`

## After deploy checklist

- [ ] Site opens on the public URL  
- [ ] Contact form sends email  
- [ ] `/admin/dashboard.html` login works  
- [ ] CV downloads  
- [ ] Replace `assets/Samuel-Success-CV.pdf` with your real CV  
- [ ] Add real projects in Admin → Content  

## Your share link

After Render finishes (2–5 minutes), your link looks like:

**https://samsuc-portfolio-xxxx.onrender.com**

Share that. (Free tier may sleep after inactivity — first load can take ~30s.)
