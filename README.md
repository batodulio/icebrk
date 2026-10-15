# IceBrk

**Bonding made simple.**

This README exists so that any AI assistant (Claude Code, Claude in chat, etc.) or new contributor working on this codebase has the full picture of what IceBrk is, who it's for, and how it should look, sound, and be built — without needing to be re-briefed every session.

---

## What IceBrk is

IceBrk is a web-based SaaS platform for customizable icebreaker and party games, built for **corporate events, schools, and everyday gatherings**. Hosts pick a game from a library, customize it to their group in minutes, and run it live — no planning from scratch, no juggling separate apps for timing and scorekeeping.

**Vision statement** (use this language, or close paraphrases, in any user-facing copy):
> "We're all about genuine connection and fun. Create instant bonding and memories with friends, zero setup needed!"

**Mission / why this exists:**
IceBrk exists to remove the friction between people and connection. Too often, real bonding gets lost in the busywork of planning, the search for "the right icebreaker," or the awkwardness of a room full of strangers. Every feature built should serve one outcome: helping people laugh together, open up, and walk away with a memory worth keeping — whether that's a team of coworkers, a classroom of students, or a group of friends at a party.

**Target audience:** Corporate events, schools, and everyday gatherings.

**Contact:** icebrkmnl@outlook.com / icebrkmnl@gmail.com

---

## Product architecture: the 3-tab game module

Every game in IceBrk is a self-contained module wrapped in the shared `GameShell`, with the same two tabs. A host who learns one game can run any of them.

1. **Customize Game** — questions, prompts, rosters, and theme, set up beforehand. The host utilities (timer, roster/team setup, color theme) live here, built once in `src/games/shared` and reused by every game rather than rebuilt per game.
2. **Play Arena** — the live surface projected or shared during the event.

*(The original plan called for a third Utilities tab; in practice the utilities read better inside Customize, so shipped modules have two.)*

### Game library (planned, in build order)
1. **Jeopardy** — customizable trivia board *(already built — original proof of concept used a Batman theme; production version uses IceBrk branding)*
2. **Would You Rather** — chosen as game #2; no scoring logic needed, simplest possible second build
3. Two Truths and a Lie
4. Bingo
5. Scavenger Hunt
6. (library continues to grow from here)

---

## How this gets built

The library and the architecture grew together, one validated step at a time. All five original games shipped, accounts arrived, and in August 2026 hosting moved from Vercel + Supabase to **Azure, running entirely on always-free tiers.**

### Current architecture (live)

```
push to main
  → GitHub Actions        lint · typecheck · vite build · npm prune --omit=dev
  → OIDC federated login  no stored password; app registration gh-icebrk-deploy
  → Azure App Service     F1 Free · Linux · Node 22 · Southeast Asia
      ├── Express         server.js: serves dist/, /api/auth/*, /api/settings/:gameId, SPA fallback
      ├── sign-in         username + password, scrypt hashes in dbo.users, signed HttpOnly cookie
      └── managed identity → Azure SQL (free offer) with Row Level Security
```

| Layer | What runs there |
|---|---|
| **Repo / CI-CD** | GitHub `batodulio/icebrk`, deploys from `main` via `.github/workflows/azure-app-service.yml` |
| **Host** | Azure App Service `icebrk-app`, plan `AZ-ASP-ICEBRK-TEST-01` (F1 Free) |
| **Auth** | Username + password, handled by `server.js`: scrypt hashes in `dbo.users`, a 30-day HMAC-signed HttpOnly session cookie, 20 sign-in attempts per 15 min per IP |
| **API** | Express in `server.js` — `/api/auth/{signup,login,logout,me}`, `/api/settings/:gameId`, and `/api/images` (Jeopardy clue pictures), parameterised queries, 64 KB settings cap, 300 KB per picture, 120 req/min per caller |
| **Database** | Azure SQL `icebrk-test` on `sql-icebrk-test`, free offer, serverless with auto-pause |
| **Schema** | `dbo.users` for accounts, one `dbo.game_settings` table for all six games, `dbo.clue_images` for clue pictures; see `db/azure-sql-schema.sql` |
| **Isolation** | Row Level Security via `sp_set_session_context`, set in the same batch as each query |
| **Secrets** | None in code. The database is reached by the app's managed identity; app settings hold `SQL_SERVER`, `SQL_DATABASE`, and `SESSION_SECRET` (the cookie signing key) |

**Cost: $0/month.** Every service sits inside an always-free tier.

### Known constraints of the free tiers

- **F1 gives 60 CPU-minutes/day** and unloads the app after 20 minutes idle, so the first visitor after a quiet spell waits through a cold start.
- **No custom domain on F1** — the app lives at `icebrk-app-*.azurewebsites.net`. A custom domain starts at the Shared (D1) tier, and TLS for it at Basic (B1).
- **Azure SQL free offer** allows ~55 hours of active compute a month at the 0.5 vCore floor, so auto-pause stays on and the first query after idle is slow.
- **Sign-in is deliberately simple for now:** a username and password, with no email, so there is no password reset yet. A host who forgets their password starts a fresh account.

### What is deliberately absent

No Stripe, Resend, Sentry, Realtime, or Storage yet. Add them when a real need appears, not before.

---

## Brand identity

IceBrk's visual identity is **fun, colorful, casual, and high-energy** — closer to a game show or party invite than a corporate SaaS dashboard. This replaced an earlier corporate/editorial branding system (navy blue, serif type, subtle dotted rings) that no longer represents the brand — never default back to that look.

### Colors

Primary quartet — bold, saturated, full opacity. Use at least 2-3 of these four together in any hero section or key visual:

| Color | Hex | Role |
|---|---|---|
| IceBrk Blue | `#1A56C4` | Primary / brand anchor |
| Energy Orange | `#F47920` | Primary / CTAs |
| Sky Blue | `#38B6FF` | Primary / links |
| Vitality Green | `#00A651` | Success / correct answer |

Secondary / celebration accents (badges, timers, team colors):

| Color | Hex | Role |
|---|---|---|
| Sunshine Yellow | `#FFD23F` | Energy accent / timers — pairs with Charcoal Ink text, never white |
| Playful Purple | `#8338EC` | Variety accent / team colors |

Neutrals:

| Color | Hex | Role |
|---|---|---|
| Charcoal Ink | `#22223B` | Body text / headings (never pure black) |
| Cloud White | `#FFFDF7` | Warm background (never stark white) |

### Typography

- **Display / headings:** Baloo 2 — bold, rounded, high-personality (weights 500–800)
- **Body / UI:** Poppins — geometric, clean, friendly (weights 400–700)
- Never use serif fonts or thin/light weights. Keep type bold (600+) on any colored background for legibility and energy.

```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Shape language

Bold confetti energy, not subtle corporate texture:
- **Confetti blobs** — solid filled circles at 80–100% opacity, bleeding off card/section corners
- **Scattered dots & triangles** — small, mixed-color, near CTAs and celebratory moments (never near body text)
- Never use low-opacity (6–15%) decorative shapes, dashed hairline rings, or sharp corners. Round every corner (buttons, cards, containers).

### Components

- **Buttons:** pill-shaped (`border-radius: 999px`), bold fill, bold text (weight 700). Primary = IceBrk Blue; Success = Vitality Green; Accent = Energy Orange; Energy = Sunshine Yellow fill with Charcoal Ink text; Outline = transparent with a 3px bold border (never a thin hairline)
- **Tags/badges:** pill-shaped, bright solid fills (never pale tints)
- **Game cards:** bold color fill + 1–2 confetti blobs bleeding off corners + pill-shaped status badge
- **Celebration moments** (correct answer, game complete): bold fill background + 3–4 scattered confetti blobs/dots + large Baloo 2 headline

### Accent strategy — when to use which color
- **Vitality Green:** correct answers, completed games, success badges, positive-motion CTAs ("Start game")
- **Energy Orange:** primary CTAs, "Customize" actions, high-energy moments
- **Sunshine Yellow:** timers, countdowns, urgency states, celebratory badges
- **Playful Purple:** team colors and alternate category tags when more than 4 distinct colors are needed

---

## Brand voice & positive scripting

This is a hard rule, not a style suggestion: **positive scripting only.**

- **Never use negation words** in headlines, UI copy, or marketing language: no, zero, less, can't, without, etc.
- Say what IceBrk *does*, not what it removes or eliminates.
- Casual, warm, emotion-first tone — like a fun friend hosting the party, never a vendor pitching enterprise software.
- Lead with connection, fun, and memories — not features or specs.
- Filipino-inclusive identity is part of the brand's origin story (e.g. the `icebrkmnl` email handle, "no pakulo" language) — this local flavor is a feature, not something to dilute into generic corporate voice.

| ✅ On brand | ❌ Avoid |
|---|---|
| "Create instant bonding and memories with friends, zero setup needed!" | "Eliminate the hassle of awkward, unproductive team-building sessions." |
| "Bonding made simple." | "Built on Trust. Designed to Last." |

If you (the AI assistant) catch a draft using a negation word in user-facing copy, rewrite it before presenting it — don't wait to be asked.

---

## Working conventions

- **Match the live architecture** described above: React SPA served by Express on Azure App Service, username + password sign-in through `/api/auth`, Azure SQL behind `/api`. Guest play stays session-local in `sessionStore`; signed-in hosts sync through `useCloudSync`.
- **Keep credentials out of the codebase.** The database is reached by managed identity, and CI signs in with an OIDC federated credential. The one secret, `SESSION_SECRET`, lives in App Service settings. If a change seems to need another stored secret, that is a signal the approach is wrong.
- **Every game follows the 2-tab pattern** (Customize Game / Play Arena) inside `GameShell` — don't introduce a different structure for a new game without a strong reason.
- **Utilities (Timer, Team Setup, Scorecard) are shared, not duplicated** — when adding a new game, reuse the existing utility components/logic rather than rebuilding them.
- **Apply the brand system automatically** to anything user-facing (UI, copy, marketing assets) without needing to be re-asked each time — colors, fonts, shape language, and positive-scripting voice should be the default, not an afterthought.
- **Don't reintroduce the old corporate branding** (navy blue anchor, serif type, low-opacity dotted rings) — it has been fully superseded.

---

*Last updated: August 16, 2026, when hosting moved to Azure. Source of truth lives in the IceBrk Notion workspace (🧊 icebrk teamspace) — this README is a synced summary for AI assistants and contributors working in this repo.*
