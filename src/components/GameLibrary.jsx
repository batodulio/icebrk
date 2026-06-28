const GAMES = [
  {
    bg: 'var(--ib-blue)',
    tilt: 'tilt-l',
    blobs: [
      { w: 90, h: 90, bg: 'var(--sky-blue)', pos: { top: -30, right: -30 } },
      { w: 50, h: 50, bg: 'var(--vitality-green)', pos: { bottom: -20, left: -10 } },
    ],
    title: 'Jeopardy',
    tagline: 'Trivia showdown, your categories',
    badge: { text: 'Play now', bg: 'var(--sunshine)', color: 'var(--ink)' },
  },
  {
    bg: 'var(--sunshine)',
    text: 'var(--ink)',
    tilt: 'tilt-r',
    blobs: [
      { w: 80, h: 80, bg: 'var(--ib-blue)', pos: { top: -26, right: -20 } },
      { w: 14, h: 14, bg: 'var(--white)', pos: { bottom: 18, left: 18 } },
    ],
    title: 'Would You Rather',
    tagline: 'Pick a side, defend it',
    badge: { text: 'Coming soon', bg: 'var(--ink)', color: 'var(--white)' },
  },
  {
    bg: 'var(--vitality-green)',
    tilt: 'tilt-l',
    blobs: [
      { w: 90, h: 90, bg: 'var(--sky-blue)', pos: { bottom: -30, right: -20 } },
      { w: 14, h: 14, bg: 'var(--sunshine)', pos: { top: 18, left: 24 } },
    ],
    title: 'Bingo',
    tagline: 'Mark the board, shout it out',
    badge: { text: 'Coming soon', bg: 'var(--white)', color: 'var(--vitality-green)' },
  },
  {
    bg: 'var(--purple)',
    tilt: 'tilt-r',
    blobs: [{ w: 80, h: 80, bg: 'var(--sunshine)', pos: { top: -24, right: -24 } }],
    title: 'Two Truths & a Lie',
    tagline: "Guess what's real",
    badge: { text: 'Coming soon', bg: 'var(--white)', color: 'var(--purple)' },
  },
  {
    bg: 'var(--sky-blue)',
    tilt: 'tilt-l',
    blobs: [{ w: 70, h: 70, bg: 'var(--vitality-green)', pos: { bottom: -24, left: -16 } }],
    title: 'Scavenger Hunt',
    tagline: 'Find it, snap it, win it',
    badge: { text: 'Coming soon', bg: 'var(--white)', color: 'var(--sky-blue)' },
  },
  {
    bg: 'var(--ink)',
    tilt: 'tilt-r',
    blobs: [
      { w: 60, h: 60, bg: 'var(--sunshine)', pos: { top: -20, right: 20 } },
      { w: 40, h: 40, bg: 'var(--sky-blue)', pos: { bottom: -16, left: 30 } },
    ],
    title: 'Your Game Here',
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
          A game for every kind of gathering. New games join the library all the time.
        </p>
        <div className="game-grid">
          {GAMES.map((g) => (
            <div className={`game-card ${g.tilt}`} style={{ background: g.bg, color: g.text || 'var(--white)' }} key={g.title}>
              {g.blobs.map((b, i) => (
                <div
                  className="game-blob"
                  key={i}
                  style={{ width: b.w, height: b.h, background: b.bg, ...b.pos }}
                />
              ))}
              <h4>{g.title}</h4>
              <p className="tagline">{g.tagline}</p>
              <span className="game-badge" style={{ background: g.badge.bg, color: g.badge.color }}>
                {g.badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
