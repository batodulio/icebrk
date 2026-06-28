const VALUES = [
  {
    color: 'var(--ib-blue)',
    tint: '#EAF1FB',
    num: '1',
    title: 'Ready in minutes',
    body: "Choose a game, drop in your group's details, and you're live in minutes.",
  },
  {
    color: 'var(--energy-orange)',
    tint: '#FDECDF',
    num: '2',
    title: 'Fully customizable',
    body: "Swap in your own questions, your team's colors, your school's mascot. Every game bends to fit your group.",
  },
  {
    color: 'var(--vitality-green)',
    tint: '#E3F7EC',
    num: '3',
    title: 'Built-in host tools',
    body: 'Timer, team setup, and scorecard come standard with every game, all living in one place.',
  },
]

export default function ValueProps() {
  return (
    <section>
      <div className="wrap">
        <p className="eyebrow">Why IceBrk</p>
        <h2 className="section-title">Everything you need, already built in</h2>
        <p className="section-sub">
          Hosts focus on the people in the room. IceBrk handles the rest.
        </p>
        <div className="value-grid">
          {VALUES.map((v) => (
            <div className="value-card" key={v.num} style={{ background: v.tint, borderTop: `6px solid ${v.color}` }}>
              <div className="value-icon" style={{ background: v.color }}>{v.num}</div>
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
