import { Fragment } from 'react'

const STEPS = [
  {
    icon: '✏️',
    iconBg: 'var(--sunshine)',
    title: 'Customize Game',
    body: 'Names, questions, timers, themes. Everything you set up lives in one friendly tab.',
  },
  {
    icon: '🎉',
    iconBg: 'var(--sky-blue)',
    title: 'Play Arena',
    body: 'Project the arena and let the room take over. Wheels spin, boards light up, scores climb.',
  },
  {
    icon: '🏆',
    iconBg: 'var(--energy-orange)',
    title: 'Crown the Winners',
    body: 'Confetti bursts, fanfares play, bragging rights get awarded. Every game ends with a moment.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="deco-blob" style={{ width: 180, height: 180, background: 'var(--sky-blue)', opacity: 0.9, top: -80, right: -60 }} />
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title">Two tabs, every game, every time</h2>
        <p className="section-sub">Learn the pattern once (Customize Game, then Play Arena) and you can run anything in the IceBrk library.</p>
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
