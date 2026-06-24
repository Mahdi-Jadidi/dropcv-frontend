# QA Report

Date: 2026-06-24

## Scope

Verified the main frontend funnel on the static site:

- `index.html`
- `signup.html`
- `dashboard-basic.html`
- `discovery.html`
- `privacy.html`
- `terms.html`
- `design-system.css`
- `api/dropcv-api.js`

## Results

| Area | Status | Notes |
|---|---|---|
| Landing page flow | Passed | Reordered the funnel to keep a single visible closing CTA path and moved the cinematic block to the end of the main content. |
| Pricing copy | Passed | Updated the Basic CTA to `Start free — no card needed →`. |
| Footer links | Passed | Added `privacy.html` and `terms.html` to remove footer 404s. |
| Local assets | Passed | Static scan found no missing local `href`/`src` targets in the core pages. |
| Served routes | Passed | Local server returned HTTP 200 for the key routes and static assets. |
| Reduced motion support | Passed | Existing reduced-motion rules remain in place in the shared CSS and landing page. |
| Browser automation | Passed | Real browser QA was completed in the in-app browser with mobile viewport checks, signup completion, dashboard verification, and discovery interaction checks. |

## Issues Found And Fixed

1. The landing page had duplicate end-of-funnel CTAs and the cinematic sequence was positioned before pricing/features in the intended flow.
2. The footer linked to missing `privacy.html` and `terms.html` pages.
3. The bottom auth block could reappear as a second CTA, which broke the single-conversion-path goal.
4. Discovery depended on an API route that is not available in the local static setup, which left the page stuck on the error state until a client-side fallback was added.

## Verification Notes

- Core routes returned `200` from the local static server.
- Google Fonts preconnect and stylesheet links are present on the main pages.
- Shared design tokens remain on `design-system.css`.
- Reduced-motion handling is still present on the landing page and shared CSS.
- Second-pass mobile polish tightened the landing hero search, final CTA spacing, signup gutters, and floating button safe-area offsets.
- Browser-backed mobile checks confirmed discovery spacing improved and the dashboard mobile shell now has tighter paddings/gutters.
- The signup flow now completes in the browser and lands on the dashboard route.
- Discovery search now falls back to local data when the discovery API is unavailable in the local environment.
- Mobile homepage now includes a compact pricing/features preview in the hero so the key sections are visible without a long scroll.
