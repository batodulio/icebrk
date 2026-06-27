---
name: icebrk-branding
description: Applies IceBrk's official brand identity (colors, typography, voice, decorative elements) to any artifact being created for IceBrk — slide decks, documents, landing pages, mockups, diagrams, social posts, or UI. Use this skill whenever the user is creating IceBrk-branded content, mentions IceBrk by name, or asks for something to look "fun," "colorful," "playful," or "game-show energy" in the context of icebreaker games, corporate events, school activities, or gatherings. Always apply this skill instead of generic or corporate styling when producing IceBrk material.
license: Proprietary — for IceBrk internal use
---

# IceBrk Brand Identity

## Overview

IceBrk is a SaaS platform for customizable icebreaker and party games, built for corporate events, classrooms, and everyday gatherings. The brand identity is **fun, colorful, casual, and high-energy** — closer to a game show or party invite than a corporate SaaS dashboard. This skill replaces any prior corporate/blue-led branding system; IceBrk should never look buttoned-up, muted, or "enterprise."

**Keywords**: IceBrk, icebreaker games, branding, brand colors, brand voice, game-show, playful design, party game SaaS, bonding, corporate events, gatherings

## Brand Foundations

**Name:** IceBrk
**Tagline:** Bonding made simple.
**Vision:** "We're all about genuine connection and fun. Create instant bonding and memories with friends, zero setup needed!"
**Elevator pitch:** IceBrk is a web-based SaaS platform for customizable icebreaker and party games, built for corporate events, classrooms, and everyday gatherings. Instead of scrambling to plan activities, hosts launch a ready-made, fully brandable game in minutes, so the focus stays on the people in the room, not the logistics.
**Statement of intention:** IceBrk exists to remove the friction between people and connection, so people laugh together, open up, and walk away with a memory worth keeping.

These statements aren't just reference copy — pull from this language (or close paraphrases) whenever an artifact needs a headline, hero text, or About section, so messaging stays consistent across everything IceBrk-branded.

## Brand Voice

- **Casual and warm**, never corporate. Talk like a fun friend hosting the party, not a vendor pitching software.
- **Positive scripting only.** Avoid negation words (no, zero, less, can't, without). Say what IceBrk *does*, not what it removes. ("Create instant bonding" not "skip the awkward silence.")
- **Emotion-first.** Lead with connection, fun, and memories — not features or specs.
- **Short and punchy.** Favor short sentences and exclamation energy over long corporate paragraphs.
- **Filipino-inclusive identity** is part of the brand's origin story (e.g. the `icebrkmnl` handle) — local flavor is a feature, not something to dilute into generic global-corporate voice.

## Colors

Game-show bright primaries — bold, saturated, high contrast. This is the opposite of muted/pastel/corporate-blue.

**Primary Palette:**

| Color | Hex | Role |
|---|---|---|
| IceBrk Blue | `#1A56C4` | Primary brand color — buttons, headlines, brand anchor |
| Energy Orange | `#F47920` | Primary accent — CTAs, highlights, "fun" moments |
| Sky Blue | `#38B6FF` | Primary accent — secondary CTAs, links, lighter contrast to IceBrk Blue |
| Vitality Green | `#00A651` | Primary accent — success states, "correct answer," positive feedback |
| Charcoal Ink | `#22223B` | Body text — never pure black, keeps warmth |
| Cloud White | `#FFFDF7` | Background — warm off-white, not stark white |

**Secondary / Celebration Accents** (use sparingly, for highlights and celebratory moments — confetti, winner states, badges):

| Color | Hex | Role |
|---|---|---|
| Sunshine Yellow | `#FFD23F` | Energy accent — timers, urgency, countdowns, badges |
| Playful Purple | `#8338EC` | Variety accent — team colors, alternate category tags |

**Color usage rules:**
- Lead with **IceBrk Blue, Energy Orange, Sky Blue, and Vitality Green together** — this quartet is IceBrk's signature game-show combo. Don't default to a single-color corporate scheme.
- Use at least 2-3 of the 4 primaries in any hero section, title card, or key visual.
- Vitality Green is reserved for positive/success moments (correct answers, completed games) — don't use it as a base UI color everywhere.
- Secondary accents (yellow/purple) are for *moments* — a timer running low, a team badge — not base UI chrome.
- Backgrounds stay warm (Cloud White), never stark white or corporate gray.
- High contrast and full opacity are encouraged here — unlike muted corporate systems, IceBrk's shapes and colors can be bold and saturated, not subtle.

## Typography

**Bold rounded sans-serif** — playful, friendly, app-like. This is the typographic opposite of an editorial serif like Playfair Display.

- **Headings & Display:** Baloo 2 (rounded, bold, high-personality) — fallback: Poppins, then Arial Rounded/Arial
- **Body & UI text:** Poppins (clean, geometric, friendly) — fallback: Arial
- Headings are bold (700) and can be large/oversized for energy — don't be shy with heading scale.
- Avoid thin weights; IceBrk type should feel confident and chunky, never delicate or light.
- Avoid serif fonts entirely — they read as editorial/corporate, which is the look IceBrk is moving away from.

```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Shape & Decorative Language

Where the old corporate guide used thin dotted rings and subtle low-opacity semi-circles, IceBrk's shape language is **bold, chunky, and game-like**:

- **Thick rounded blobs and bubbles** — solid filled circles/blobs in primary colors, used at full or near-full opacity (not 6–15% like a corporate system). These should look like confetti or party balloons, not subtle corporate watermarks.
- **Chunky rounded corners everywhere** — buttons, cards, and containers use generous border-radius (16–24px+), never sharp corners. Rounded = friendly and game-like.
- **Confetti/burst accents** — small scattered shapes (dots, triangles, stars) in mixed primary colors near celebratory moments (winner screens, completed games, CTAs).
- **Thick borders over thin hairlines** — where a corporate system uses 1–2px subtle borders, IceBrk can use bolder 3–4px borders in a primary color for emphasis.
- Avoid: dashed hairline rings, low-opacity watermark shapes, anything that reads as "subtle corporate texture." If a decorative element doesn't read as fun at a glance, it's too subtle for this brand.

## Components

**Buttons:**
- Big, chunky, rounded (pill-shaped or 16px+ radius)
- Bold primary color fills (IceBrk Blue or Energy Orange) with white text, OR Sunshine Yellow fill with Charcoal Ink text
- Bold/heavy font weight (600-700), never a thin label
- Hover/press states can use a slight bounce or scale effect in interactive contexts

**Tags & badges:**
- Pill-shaped, bright solid fills (not pale tints like a corporate system)
- White or Charcoal Ink text depending on background brightness (use Charcoal Ink on Sunshine Yellow; white on IceBrk Blue/Sky Blue/Energy Orange/Vitality Green/Playful Purple)

**Cards:**
- Rounded corners (16-24px), Cloud White or bright color fill
- Playful drop shadow is acceptable here (unlike strict flat-design systems) to give a "physical game piece" feel — think a card you could pick up
- Avoid sharp-edged, flat, minimal corporate card styling

## Component Examples (reference code)

Concrete, working patterns for the components described above. Use these as starting templates rather than re-deriving the style each time.

**Game library card** — bold color fill, confetti-blob accents bleeding off the edges, pill-shaped status badge:
```html
<div style="background:#1A56C4;border-radius:20px;padding:20px;color:white;position:relative;overflow:hidden">
  <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:#38B6FF"></div>
  <div style="position:absolute;bottom:-30px;left:-20px;width:60px;height:60px;border-radius:50%;background:#F47920;opacity:0.8"></div>
  <div style="position:relative;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:20px;margin-bottom:4px">Jeopardy</div>
  <div style="position:relative;font-size:13px;opacity:0.85;margin-bottom:14px">Trivia showdown</div>
  <div style="position:relative;display:inline-block;background:#FFD23F;color:#22223B;font-weight:700;font-size:11px;padding:5px 12px;border-radius:20px">Built</div>
</div>
```
Rotate the fill color (IceBrk Blue / Energy Orange / Vitality Green) and the two accent-blob colors per card so a grid of game cards reads as varied and playful, not repetitive. Status badge background should contrast with the card fill (e.g. Sunshine Yellow badge on a blue card).

**Buttons** — pill-shaped, bold fill, no thin labels:
```html
<button style="font-family:'Poppins',sans-serif;font-weight:700;font-size:14px;background:#1A56C4;color:white;border:none;border-radius:999px;padding:13px 26px;cursor:pointer">Start game</button>

<button style="font-family:'Poppins',sans-serif;font-weight:700;font-size:14px;background:#FFD23F;color:#22223B;border:none;border-radius:999px;padding:13px 26px;cursor:pointer">Invite players</button>

<!-- Outline variant: 3px bold border, not a thin 1px hairline -->
<button style="font-family:'Poppins',sans-serif;font-weight:700;font-size:14px;background:transparent;color:#1A56C4;border:3px solid #1A56C4;border-radius:999px;padding:10px 26px;cursor:pointer">Save template</button>
```

**Utility cards (Timer / Scorecard / Team setup)** — white fill, 3px bold color border instead of a thin hairline:
```html
<!-- Timer -->
<div style="background:white;border:3px solid #38B6FF;border-radius:18px;padding:18px;text-align:center">
  <div style="font-size:12px;font-weight:600;color:#22223B;opacity:0.6;margin-bottom:6px">Timer</div>
  <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:32px;color:#1A56C4">00:30</div>
</div>

<!-- Scorecard -->
<div style="background:white;border:3px solid #00A651;border-radius:18px;padding:18px">
  <div style="font-size:12px;font-weight:600;color:#22223B;opacity:0.6;margin-bottom:10px">Scorecard</div>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:13px;font-weight:600;color:#22223B">Team blue</span>
    <span style="background:#1A56C4;color:white;font-weight:700;font-size:12px;padding:3px 10px;border-radius:20px">320</span>
  </div>
</div>
```
Match the border color to a primary that relates to the utility's function (Sky Blue for Timer, Vitality Green for Scorecard, Sunshine Yellow for Team setup) — this gives quick visual sorting without needing icons.

**Celebration / winning moment** — bold fill background, scattered confetti dots, used for correct answers, round wins, or game completion:
```html
<div style="background:#1A56C4;border-radius:20px;padding:24px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-30px;right:30px;width:90px;height:90px;border-radius:50%;background:#FFD23F;opacity:0.9"></div>
  <div style="position:absolute;bottom:-40px;right:-20px;width:100px;height:100px;border-radius:50%;background:#38B6FF"></div>
  <div style="position:absolute;top:50%;left:30px;width:14px;height:14px;border-radius:50%;background:#00A651"></div>
  <div style="position:absolute;top:20%;left:50%;width:10px;height:10px;border-radius:50%;background:#F47920"></div>
  <div style="position:relative;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:24px;color:white;max-width:300px">Correct answer!</div>
  <div style="position:relative;font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;max-width:280px">Team blue takes the lead</div>
</div>
```
Always pair big celebratory text (Baloo 2, 700-800 weight) with at least 2-3 scattered confetti-dot accents at varying sizes — a single flat color block reads as a corporate notification, not a celebration.

**Player/team tags** — small pill badges, rotate through primaries (including Playful Purple) so team members feel visually distinct:
```html
<span style="background:#1A56C4;color:white;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px">Maya</span>
<span style="background:#8338EC;color:white;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px">Jay</span>
<span style="background:#F47920;color:white;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px">Ana</span>
```

## Do's and Don'ts

**Do:**
- Use IceBrk Blue + Energy Orange + Sky Blue + Vitality Green together as the signature combo
- Keep type bold, rounded, and confident (Baloo 2 / Poppins)
- Lead messaging with fun, connection, and memories (per Brand Voice)
- Use full-opacity bold shapes and confetti-style accents
- Keep corners rounded everywhere — buttons, cards, containers

**Don't:**
- Don't default to a single muted corporate color or use only one of the four primaries everywhere
- Don't use serif fonts or thin/light font weights
- Don't use low-opacity (6-15%) decorative shapes — this brand is bold, not subtle
- Don't write headlines or copy using negation words (no, zero, less) — see Brand Voice
- Don't use sharp corners or flat hairline borders as the primary visual language

## Reference: What Changed From the Old Branding Guide

The original `Branding Guide.html` (Deep Royal Blue `#003DA5`, Playfair Display, dotted rings, low-opacity semi-circles) was a corporate/editorial system better suited to a large consumer enterprise brand. This skill replaces it for IceBrk. If asked to compare, the shift is:

| Old (corporate) | New (IceBrk) |
|---|---|
| Deep Royal Blue `#003DA5` as sole anchor | IceBrk Blue, Energy Orange, Sky Blue, Vitality Green as a quartet |
| Playfair Display (serif) | Baloo 2 (rounded sans) |
| Low-opacity dotted rings | Bold confetti/blob bursts |
| "Built on Trust. Designed to Last." | "Bonding made simple." |
| Subtle, restrained, editorial | Bold, saturated, game-show energy |
