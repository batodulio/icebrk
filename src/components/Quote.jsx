const TESTIMONIALS = [
  {
    mark: 'var(--sunshine)',
    text: 'Such a fun way to break the ice with the team!',
    author: 'Team Lead, corporate offsite',
  },
  {
    mark: 'var(--sky-blue)',
    text: 'Setup was quick and the kids loved every round.',
    author: 'Classroom Teacher',
  },
  {
    mark: 'var(--vitality-green)',
    text: 'Easiest game night we have ever hosted.',
    author: 'Friend Group Organizer',
  },
]

export default function Quote() {
  return (
    <section id="quote" className="quote-section">
      <div className="deco-blob" style={{ width: 200, height: 200, background: 'var(--sky-blue)', opacity: 0.85, top: -100, right: -60 }} />
      <div className="wrap">
        <div className="quote-grid">
          {TESTIMONIALS.map((t) => (
            <div className="quote-card" key={t.author}>
              <div className="quote-mark" style={{ color: t.mark }}>&ldquo;</div>
              <p className="quote-text">{t.text}</p>
              <p className="quote-author">{t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
