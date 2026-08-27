# How Long Before I Go Broke Calculator

Retirement and Longevity Calculator.

Estimates whether a nest egg will last through a chosen longevity age while healthcare costs, inflation, lifestyle phases, and part-time work change over time.

**Production URL:** https://retirement-and-longevity-calculator.vercel.app

## Description

Most retirement tools draw a straight line of spending and ignore how real costs move with age. This calculator’s backend runs a year-by-year projection that:

- Inflates **lifestyle** at general CPI and **healthcare** at a higher medical inflation rate
- Scales lifestyle through **go-go, slow-go, and no-go** years
- Raises medical intensity after 65, 75, and 85, with optional long-term care
- Adds **senior home rental**, **nursing home**, or **continuing-care (CCRC) rent**, using one facility at a time and trimming lifestyle spend while you live there
- Credits **part-time / side-hustle** income only during a phased-work window
- Compares that dynamic path to a straight-line model so the longevity gap is visible

The one-page interface is organized around a **Retirement Longevity Outlook**: funded-through age, remaining balance, healthcare share of spending, and a chart of portfolio vs. changing costs.

This is an educational model, not tax, investment, or medical advice.

## Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS — a single page
- **Backend:** Next.js Route Handlers (`/api/calculate`, `/api/assumptions`, `/api/health`)
- **Engine:** Deterministic TypeScript projection in `src/lib/engine`

## Ads

Labeled IAB-style slots sit in the header, between form sections, in the sidebar, around results, and in the footer. Set `NEXT_PUBLIC_ADSENSE_CLIENT` to attach a live AdSense publisher id; otherwise the slots render as placeholders.

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

Project: [retirement-and-longevity-calculator](https://vercel.com/r3s0lv343vrs-projects/retirement-and-longevity-calculator)  
Production: https://retirement-and-longevity-calculator.vercel.app  
Framework: Next.js · Root directory: repository root · No required environment variables.

The GitHub repo is connected. Pushes to `main` deploy production; other branches get preview URLs.

## License

Private/educational use unless the repository owner states otherwise.
