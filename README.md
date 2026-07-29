# SAMSUC — Samuel Success Portfolio

Futuristic full-stack personal portfolio with admin CMS, contact API, analytics, and inbox.

## Local run

```bash
cd backend
npm install
cp .env.example .env   # fill JWT_SECRET, email, etc.
npm run create-admin -- you@email.com "Password123" "Samuel Success"
npm run dev
```

Open http://localhost:5000

Admin:
- http://localhost:5000/admin/dashboard.html
- http://localhost:5000/admin/messages.html
- http://localhost:5000/admin/content.html

## Deploy

See **DEPLOY.md** for Render / Vercel steps and how to get a public share link.
