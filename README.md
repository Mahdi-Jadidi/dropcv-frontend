# drop.cv

Monorepo for the drop.cv product:

- `drop.cv-frontend`: public website and app UI
- `dropcv-backend`: API, auth, upload, analytics, and billing services

## Quick start

- Frontend: `npm --prefix drop.cv-frontend run dev`
- Backend: `npm --prefix dropcv-backend start`
- Backend test suite: `npm --prefix dropcv-backend test`

## Deploy notes

- The frontend builds as a standalone Next.js app.
- The backend is a Fastify service with its own Docker and nginx deployment assets.
- Keep `drop.cv-frontend` and `dropcv-backend` versioned together in this repo, but deploy them as separate services.
- On Vercel, point the project root at `drop.cv-frontend` for the frontend app.
- Deploy the backend to a Node-capable host, or refactor it into Vercel-compatible serverless routes before trying to host it on Vercel.

## Live QA

- Frontend: [https://dropcv-frontend.vercel.app/](https://dropcv-frontend.vercel.app/)
- Backend: [https://drop-cv-backend.vercel.app](https://drop-cv-backend.vercel.app)
- Sync production config files: `npm run sync:live-configs`
- Endpoint smoke: `npm run smoke:live`
- Browser smoke: `npm run smoke:live:browser`
- Full live QA: `npm run qa:live`
