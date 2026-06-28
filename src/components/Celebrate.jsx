export default function Celebrate() {
  return (
    <section className="celebrate-section">
      <div className="deco-blob" style={{ width: 240, height: 240, background: 'var(--sunshine)', opacity: 0.9, top: -100, left: -80 }} />
      <div className="deco-blob" style={{ width: 16, height: 16, background: 'var(--vitality-green)', top: 40, right: 120, animationDelay: '-4s' }} />
      <div className="deco-blob" style={{ width: 12, height: 12, background: 'var(--energy-orange)', bottom: 50, left: 140, animationDelay: '-3s' }} />
      <div className="wrap">
        <h2>That feeling when the whole room is laughing</h2>
        <p>That's the moment IceBrk is built for. Every game, every utility, every detail exists to get you there faster.</p>
      </div>
    </section>
  )
}
