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
          <span className="hero-eyebrow">Games for teams, classrooms &amp; every gathering</span>
          <h1>Bonding made simple.</h1>
          <p className="hero-sub">
            Pick a game, customize it to your group, and watch the room come alive.
            Just instant connection, no pakulo.
          </p>
          <div className="hero-ctas">
            <a href="#games" className="btn btn-primary">Start your first game</a>
            <a href="#games" className="btn btn-sky">Browse games</a>
          </div>
        </div>

        <div className="preview-board">
          <div className="preview-topbar">
            <span className="preview-dot" style={{ background: 'var(--energy-orange)' }} />
            <span className="preview-dot" style={{ background: 'var(--sunshine)' }} />
            <span className="preview-dot" style={{ background: 'var(--vitality-green)' }} />
          </div>
          <div className="preview-tabs">
            <span className="preview-tab active">Game arena</span>
            <span className="preview-tab">Customize game</span>
            <span className="preview-tab">Utilities</span>
          </div>
          <div className="preview-board-grid">
            <div className="preview-cat">Movies</div>
            <div className="preview-cat">Office life</div>
            <div className="preview-cat">Random</div>
            <div className="preview-cat">Pinoy pop</div>
            <div className="preview-cell">200</div>
            <div className="preview-cell alt">200</div>
            <div className="preview-cell alt2">200</div>
            <div className="preview-cell">200</div>
            <div className="preview-cell alt2">400</div>
            <div className="preview-cell">400</div>
            <div className="preview-cell alt">400</div>
            <div className="preview-cell">400</div>
          </div>
        </div>
      </div>
    </div>
  )
}
