import { GAME_CATALOG } from '../games/shared/gameCatalog'

export default function Hero() {
  return (
    <div className="hero" id="top">
      <div className="hero-scene" aria-hidden="true">
        <span className="blob one" />
        <span className="blob two" />
        <span className="blob three" />
        <span className="confetti c1" />
        <span className="confetti c2" />
        <span className="confetti c3" />
        <span className="confetti c4" />
        <span className="confetti tri" />
      </div>

      <div className="wrap hero-inner">
        <div>
          <span className="hero-eyebrow">Games For Every Gathering!</span>
          <h1>Bonding made simple.</h1>
          <p className="hero-sub">
            Pick a game, customize it to your group, and watch the room come alive.
            Just instant connection, no pakulo.
          </p>
          <div className="hero-ctas">
            <a href="#games" className="btn btn-primary">Browse Games</a>
          </div>
        </div>

        <div className="preview-board">
          <div className="preview-sticker" aria-hidden="true">✨ 6 games inside</div>
          <div className="preview-topbar">
            <span className="preview-dot" style={{ background: 'var(--energy-orange)' }} />
            <span className="preview-dot" style={{ background: 'var(--sunshine)' }} />
            <span className="preview-dot" style={{ background: 'var(--vitality-green)' }} />
          </div>
          <div className="preview-tabs">
            <span className="preview-tab">Customize Game</span>
            <span className="preview-tab active">Play Arena</span>
          </div>
          {/* Mini Play Arena: a slowly spinning roulette wheel mid-celebration. */}
          <div className="preview-arena" aria-hidden="true">
            <div className="preview-wheel-wrap">
              <span className="preview-pointer" />
              <div className="preview-wheel" />
              <span className="preview-hub">⭐</span>
              <span className="preview-spark preview-spark-1" />
              <span className="preview-spark preview-spark-2" />
              <span className="preview-spark preview-spark-3" />
              <span className="preview-spark preview-spark-4" />
            </div>
            <span className="preview-winner">🎉 Ana wins!</span>
          </div>
        </div>
      </div>

      {/* Scrolling ticker of the actual game catalog — updates itself as games ship.
          Four identical copies + a -50% translate loop: the track is always wider than
          the widest viewport, so the loop restarts on an identical frame with no gap. */}
      <div className="hero-marquee" aria-hidden="true">
        <div className="hero-marquee-track">
          {[0, 1, 2, 3].map((copy) => (
            <span className="hero-marquee-group" key={copy}>
              {GAME_CATALOG.map((g) => (
                <span className="hero-marquee-item" key={g.id}>
                  {g.emoji} {g.title}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
