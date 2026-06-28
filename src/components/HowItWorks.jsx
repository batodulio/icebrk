import { Fragment } from 'react'

const STEPS = [
  {
    icon: '✏️',
    iconBg: 'var(--sunshine)',
    title: 'Customize game',
    body: 'Add your questions, pick a theme, drop in your logo. Save it to reuse at your next event.',
  },
  {
    icon: '🛠️',
    iconBg: 'var(--energy-orange)',
    title: 'Set up utilities',
    body: 'Add your players, form teams, and you\'re ready to roll.',
  },
  {
    icon: '😂',
    iconBg: 'var(--sky-blue)',
    title: 'Play in the arena',
    body: 'Project the game arena and let the room take over. Scores update, timers run, memories happen.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="deco-blob" style={{ width: 180, height: 180, background: 'var(--sky-blue)', opacity: 0.9, top: -80, right: -60 }} />
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title">Three tabs, every game, every time</h2>
        <p className="section-sub">Learn the pattern once and you can run any game in the IceBrk library.</p>
        <div className="flow">
          {STEPS.map((s, i) => (
            <Fragment key={s.title}>
              <div className="flow-step">
                <div className="flow-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              {i < STEPS.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
