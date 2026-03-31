# GoAxonAI Developer Docs

_Last updated: 2026-04-01_

This document is a quick guide for developing and running GoAxonAI locally (frontend, backend, and the AxonApply™ extension folder).

## Maintainer

Developed and maintained by **Bollapally Manish Kumar**.

Contact: goaxonai@gmail.com

## Repo Layout

- `frontend/` — Vite + React + Tailwind
- `backend/` — Express API + Prisma
- `axonapply-extension/` — Chrome extension (AxonApply™)

## Requirements

- Node.js 18+
- PostgreSQL (or your configured Prisma datasource)

## Backend Setup (Express + Prisma)

From `backend/`:

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

Common environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`
- `GROQ_API_KEY` (or other AI provider keys, depending on features)

## Frontend Setup (Vite)

From `frontend/`:

```bash
npm install
npm run dev
```

## AxonApply™ Extension

The extension source is in `axonapply-extension/`.

For local testing:

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `axonapply-extension/` folder

In-app install guide: `/axonapply/install`
