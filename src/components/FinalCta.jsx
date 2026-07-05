export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="deco-blob" style={{ width: 260, height: 260, background: 'var(--sunshine)', opacity: 0.85, top: -110, right: -90 }} />
      <div className="deco-blob" style={{ width: 14, height: 14, background: 'var(--white)', top: '40%', left: '14%' }} />
      <div className="wrap">
        <h2>Your next gathering deserves a memory worth keeping</h2>
        <p>Every game is free and ready in seconds.</p>
        <a href="#games" className="btn btn-yellow">Start Your First Game</a>
      </div>
    </section>
  )
}
