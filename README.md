# Nestspan

Retirement and longevity income calculator. **Nestspan** estimates whether a nest egg will last through a chosen longevity age while healthcare costs, inflation, lifestyle phases, and part-time work change over time.

**Production URL:** https://retirement-and-longevity-calculator.vercel.app

> Deploy this URL by creating the Vercel project `retirement-and-longevity-calculator` from this repository. A Vercel token was requested so the agent can finish the first production deploy.

## Description

Most retirement tools draw a straight line of spending and ignore how real costs move with age. Nestspan’s backend runs a year-by-year projection that:

- Inflates **lifestyle** at general CPI and **healthcare** at a higher medical inflation rate
- Scales lifestyle through **go-go, slow-go, and no-go** years
- Raises medical intensity after 65, 75, and 85, with optional long-term care
- Credits **part-time / side-hustle** income only during a phased-work window
- Compares that dynamic path to a straight-line model so the longevity gap is visible

The one-page interface is organized around a **Retirement Longevity Outlook**: funded-through age, remaining balance, healthcare share of spending, and a chart of portfolio vs. changing costs.

This is an educational model, not tax, investment, or medical advice.

## Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS — a single page
- **Backend:** Next.js Route Handlers (`/api/calculate`, `/api/assumptions`, `/api/health`)
- **Engine:** Deterministic TypeScript projection in `src/lib/engine`

## Ads

Six labeled IAB-style slots ship on the page (header, sidebar, mid-form, before results, in results, footer). Set `NEXT_PUBLIC_ADSENSE_CLIENT` to attach a live AdSense publisher id; otherwise the slots render as placeholders.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local server |
| `npm test` | Projection engine tests |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |

## API

`POST /api/calculate` — JSON body of calculator fields (all optional; server fills defaults). Returns `input`, `years`, `outlook`, and `warnings`.

`GET /api/assumptions` — default rates and field metadata.

`GET /api/health` — liveness.

## Vercel

Project name: **retirement-and-longevity-calculator**  
Framework: Next.js · Root directory: repository root · No required environment variables.

Git auto-deploy needs the [Vercel GitHub app](https://github.com/apps/vercel) on this repo. Until then, production deploys can be CLI uploads of the main branch.

## License

Private/educational use unless the repository owner states otherwise.
