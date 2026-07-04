import { Link } from 'react-router-dom'
import { GAME_CATALOG } from '../games/shared/gameCatalog'

const catalogById = Object.fromEntries(GAME_CATALOG.map((g) => [g.id, g]))

// Visual treatment per library card. Every card routes somewhere: game ids map to
// /:gameId (module or Coming Soon), and the last slot routes to /suggest-a-game.
const GAMES = [
  {
    gameId: 'roulette',
    bg: 'var(--ib-blue)',
    tilt: 'tilt-l',
    blobs: [
      { w: 90, h: 90, bg: 'var(--sky-blue)', pos: { top: -30, right: -30 } },
      { w: 50, h: 50, bg: 'var(--vitality-green)', pos: { bottom: -20, left: -10 } },
    ],
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    gameId: 'would-you-rather',
    bg: 'var(--sunshine)',
    text: 'var(--ink)',
    tilt: 'tilt-r',
    blobs: [
      { w: 80, h: 80, bg: 'var(--ib-blue)', pos: { top: -26, right: -20 } },
      { w: 14, h: 14, bg: 'var(--white)', pos: { bottom: 18, left: 18 } },
    ],
    badge: { text: 'Play now', bg: 'var(--ink)', color: 'var(--sunshine)' },
  },
  {
    gameId: 'jeopardy',
    bg: 'var(--vitality-green)',
    tilt: 'tilt-l',
    blobs: [
      { w: 90, h: 90, bg: 'var(--sky-blue)', pos: { bottom: -30, right: -20 } },
      { w: 14, h: 14, bg: 'var(--sunshine)', pos: { top: 18, left: 24 } },
    ],
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    gameId: 'bingo',
    bg: 'var(--purple)',
    tilt: 'tilt-r',
    blobs: [{ w: 80, h: 80, bg: 'var(--sunshine)', pos: { top: -24, right: -24 } }],
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    gameId: 'two-truths-and-a-lie',
    bg: 'var(--sky-blue)',
    tilt: 'tilt-l',
    blobs: [{ w: 70, h: 70, bg: 'var(--vitality-green)', pos: { bottom: -24, left: -16 } }],
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    gameId: 'scavenger-hunt',
    bg: 'var(--ink)',
    tilt: 'tilt-r',
    blobs: [
      { w: 60, h: 60, bg: 'var(--sunshine)', pos: { top: -20, right: 20 } },
      { w: 40, h: 40, bg: 'var(--sky-blue)', pos: { bottom: -16, left: 30 } },
    ],
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    to: '/suggest-a-game',
    bg: 'var(--ink)',
    tilt: 'tilt-l',
    blobs: [
      { w: 50, h: 50, bg: 'var(--vitality-green)', pos: { top: -18, right: 18 } },
      { w: 30, h: 30, bg: 'var(--purple)', pos: { bottom: -12, left: 20 } },
    ],
    title: '💡 Your Game Here',
    tagline: "Got an idea? We're building the library together",
    badge: { text: 'Suggest a game', bg: 'var(--vitality-green)', color: 'var(--white)' },
  },
]

export default function GameLibrary() {
  return (
    <section id="games" className="game-section">
      <div className="deco-blob" style={{ width: 170, height: 170, background: 'var(--sunshine)', opacity: 0.9, top: -80, left: -60 }} />
      <div className="wrap">
        <p className="eyebrow">Game library</p>
        <h2 className="section-title">Choose the vibe</h2>
        <p className="section-sub">
          Six games, all playable right now — pick a vibe and go. New games join the library all the time.
        </p>
        <div className="game-grid">
          {GAMES.map((g) => {
            const entry = g.gameId ? catalogById[g.gameId] : null
            const title = entry ? `${entry.emoji} ${entry.title}` : g.title
            const tagline = entry ? entry.tagline : g.tagline
            return (
              <Link
                to={g.to ?? `/${g.gameId}`}
                className={`game-card ${g.tilt} game-card-clickable`}
                style={{ background: g.bg, color: g.text || 'var(--white)' }}
                key={title}
              >
                {g.blobs.map((b, i) => (
                  <div
                    className="game-blob"
                    key={i}
                    style={{ width: b.w, height: b.h, background: b.bg, ...b.pos }}
                  />
                ))}
                <h4>{title}</h4>
                <p className="tagline">{tagline}</p>
                <span className="game-badge" style={{ background: g.badge.bg, color: g.badge.color }}>
                  {g.badge.text}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
