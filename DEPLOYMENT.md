# Deployment

This repository is a monorepo:

- `drop.cv-frontend` is the Next.js app for Vercel.
- `dropcv-backend` is the Fastify API and should be deployed separately.

## Vercel frontend setup

Set these project settings in Vercel:

- Root Directory: `drop.cv-frontend`
- Build Command: `npm run build`
- Install Command: leave default
- Output Directory: leave default for Next.js

## Connected deployment URLs

- Frontend: `https://dropcv-frontend.vercel.app/`
- Backend: `https://drop-cv-backend.vercel.app`

The live pair is centralized in [`scripts/live-targets.mjs`](./scripts/live-targets.mjs). Run `npm run sync:live-configs` after changing the pair so the production config files stay in sync.

## Backend environment variables

Set these values on the backend deployment:

- `FRONTEND_URL=https://dropcv-frontend.vercel.app/`
- Leave `COOKIE_DOMAIN` unset to create a host-only authentication cookie.
- `TRUSTED_FRONTEND_ORIGINS=https://dropcv-frontend.vercel.app`
- `BACKEND_URL=https://drop-cv-backend.vercel.app`
- `ZARINPAL_MERCHANT_ID=<36-character merchant id>`
- `ZARINPAL_SANDBOX=false` (`true` outside production)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM=drop.cv <noreply@drop.cv>`

Run `migrations/001_init.sql`, `002_trial_billing.sql`,
`003_revenue_mvp.sql`, then `004_launch_safety.sql`. The final migration restores
eligible paid sites if migration 003 was previously applied, disables legacy
arbitrary-HTML deployments, and enforces one pending payment per account.

The production cookie uses `SameSite=None; Secure` because the current frontend
and API deploy on separate HTTPS hosts. Keep it host-only after moving under
`drop.cv`; never set `COOKIE_DOMAIN=.drop.cv`, because customer resume
subdomains must not share the API authentication boundary.

## Why this is required

Vercel can build the app successfully, but if the project Root Directory points at the repo root, it will validate the wrong route/function paths and fail after build completion.

## Backend deployment

Deploy `dropcv-backend` to a Node-capable host separately, then point the frontend to the backend API URL through environment variables.

## Current repo status

The repository already includes the build fixes needed for the frontend app:

- workspace-aware root package setup
- frontend build publish step
- Vercel compatibility shim for the build path

What remains is the Vercel dashboard configuration.

## Verification

- Live smoke: `npm run smoke:live`
- Browser smoke: `npm run smoke:live:browser`
- Full live QA: `npm run qa:live`
