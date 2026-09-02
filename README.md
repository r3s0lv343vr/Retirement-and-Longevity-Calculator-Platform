# Runaway Finance

Nest eggs and runways. How long money lasts, what you need today, when work can end, Social Security at 67 vs 70, later-life housing, a child through 18 and university, and whether a named goal survives.

The original tool is **How Long Before I Go Broke**. Each sibling answers one question. This is not a household planner.

**Production URL:** https://retirement-and-longevity-calculator.vercel.app

## How long before I go broke

Estimates whether a nest egg will last through a chosen longevity age while healthcare costs, inflation, lifestyle phases, and part-time work change over time.

## Description

Most retirement tools draw a straight line of spending and ignore how real costs move with age. This calculator’s backend runs a year-by-year projection that:

- Inflates **lifestyle** at general CPI and **healthcare** at a higher medical inflation rate
- Scales lifestyle through **go-go, slow-go, and no-go** years
- Raises medical intensity after 65, 75, and 85, with optional long-term care
- Adds **senior home rental**, **nursing home**, or **continuing-care (CCRC) rent**, using one facility at a time and trimming lifestyle spend while you live there
- Credits **part-time / side-hustle** income only during a phased-work window
- Compares that dynamic path to a straight-line model so the longevity gap is visible
- After you calculate, shows a **comfortable-living estimate** (budget, nest egg to fund it, extra to save per year)

The one-page interface is organized around a **Retirement Longevity Outlook**: funded-through age, remaining balance, healthcare share of spending, and a chart of portfolio vs. changing costs.

This is an educational model, not tax, investment, or medical advice.

## Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Backend:** Next.js Route Handlers (`/api/calculate`, `/api/need`, `/api/when`, `/api/claim`, `/api/housing`, `/api/child`, `/api/goal`, `/api/assumptions`, `/api/health`, `/api/collect`, `/api/admin/*`)
- **Admin:** `/admin` — visitors, site users, and calculator runs
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

## Admin

`/admin` is a password-protected dashboard. It shows unique **visitors** (browsers that loaded a public page), **site users** (visitors who ran a calculator), page views, and runs per tool. It does not store savings or other plan numbers.

On first visit, `/admin` asks you to create a password. On a normal server it is stored hashed in `.data/admin.json`. You can change it later on the dashboard. Copy that file when you move hosts if you want the same password. You do not need to set `ADMIN_PASSWORD`.

Vercel cannot keep that file across requests, so this browser also stores a hashed copy after setup or sign-in. Use the same browser to get back into `/admin` there. After you move to Hostinger, the file is enough.

`ADMIN_PASSWORD` remains an optional override if you ever want the password in the environment instead.

Visitor counts persist on a normal server in `.data/`. Redis (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) is only needed if you stay on serverless and want counts to survive.

## License

Private/educational use unless the repository owner states otherwise.
