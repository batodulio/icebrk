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

Every game in IceBrk — regardless of which game it is — is built as a self-contained module with exactly **three tabs**. This is the core pattern; a host who learns it once can run any game in the library.

1. **Game Arena** — the live play surface (what's projected/shared during the actual event)
2. **Customize Game** — game content & theme setup (questions, prompts, branding) done beforehand
3. **Utilities** — shared host tools: **Timer**, **Team Setup**, **Scorecard**

These three Utilities (Timer, Team Setup, Scorecard) should be built once and reused across every game, not rebuilt per game.

### Game library (planned, in build order)
1. **Jeopardy** — customizable trivia board *(already built — original proof of concept used a Batman theme; production version uses IceBrk branding)*
2. **Would You Rather** — chosen as game #2; no scoring logic needed, simplest possible second build
3. Two Truths and a Lie
4. Bingo
5. Scavenger Hunt
6. (library continues to grow from here)

---

## How this gets built: phased rollout

Architecture and the game library grow together, **one validated step at a time.** Don't build ahead of the current phase — each phase is only added once the previous one proves the product is worth continuing.

| Phase | Adds | Games live | Hosting | Triggered by |
|---|---|---|---|---|
| 1 | Just React — no database, no auth, no backend API. Everything lives in browser memory for the session | 2 (Jeopardy + Would You Rather) | Vercel (free) | Starting point — always build here first |
| 2 | Backend API (Node.js/Express) — still no database, just shared Timer/Team/Scorecard logic | 3 (+1) | Render (free) | A 3rd game makes duplicated utility logic obvious |
| 3 | Database (Supabase Postgres) — still no auth | 4 (+1) | Supabase (free) | Hosts want to reuse customized games across events |
| 4 | Auth + multi-tenancy (Supabase Auth + Row Level Security) — this is the line into "real SaaS" | 5 (+1) — full original library | Supabase Auth + RLS | Strangers (not just trusted contacts) start signing up |
| 5 | Native mobile app — only if the website genuinely can't do something | 6+ (ongoing) | App Store / Play Store | A specific need: push notifications, offline play, camera features, etc. |

**Currently building: Phase 1.** No database, no auth needed yet. Don't introduce a backend, database, or authentication unless explicitly asked — assume Phase 1 constraints (pure React, in-memory state, Vercel hosting) unless told otherwise.

**Tech stack (full target state, phases 3+):** React (Vite) frontend on Vercel · Node.js/Express API on Render · Supabase (Postgres + Auth + Storage + Realtime) · Stripe for billing · Resend for email · Sentry for error tracking · GitHub + GitHub Actions for repo/CI-CD · Notion for requirements/PM (offline, no runtime connection).

**Repo:** github.com/batodulio/JeopardyGame (current Jeopardy proof of concept — both plain HTML/CSS/JS and React/Vite versions exist here)

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

- **Default to Phase 1 constraints** unless told otherwise: pure React, no backend, no database, no auth, in-memory state only.
- **Every game follows the 3-tab pattern** (Game Arena / Customize Game / Utilities) — don't introduce a different structure for a new game without a strong reason.
- **Utilities (Timer, Team Setup, Scorecard) are shared, not duplicated** — when adding a new game, reuse the existing utility components/logic rather than rebuilding them.
- **Apply the brand system automatically** to anything user-facing (UI, copy, marketing assets) without needing to be re-asked each time — colors, fonts, shape language, and positive-scripting voice should be the default, not an afterthought.
- **Don't reintroduce the old corporate branding** (navy blue anchor, serif type, low-opacity dotted rings) — it has been fully superseded.

---

*Last updated: June 28, 2026. Source of truth lives in the IceBrk Notion workspace (🧊 icebrk teamspace) — this README is a synced summary for AI assistants and contributors working in this repo.*
