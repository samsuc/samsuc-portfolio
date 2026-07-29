# SAMSUC Portfolio Backend

Secure contact form API for the personal portfolio of Samuel Success.

## Features

- Input validation & sanitization
- Rate limiting
- Honeypot + duplicate detection
- Email delivery via Nodemailer (Gmail / any SMTP)
- Persistent message storage (JSON file – easy to swap for a real DB later)
- Helmet + CORS
- Environment variables for all secrets

## Quick Start

1. Copy `.env.example` → `.env` and fill in your values
2. `npm install`
3. `npm run dev` (or `npm start`)

## Email setup (Gmail)

1. Enable 2FA on your Google account
2. Create an App Password
3. Put the App Password in `EMAIL_PASS`

Alternatively use Resend, SendGrid, etc. (you can extend `emailService.js`).

## API

`POST /api/contact`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello Samuel..."
}
```

## Production tips

- Deploy backend on Railway / Render / Fly.io / Vercel (serverless)
- Point frontend form `API_URL` to your backend URL
- Or serve both frontend + backend from the same origin (already supported)
