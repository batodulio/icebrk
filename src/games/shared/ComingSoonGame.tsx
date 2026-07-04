import GameShell from './GameShell'

interface ComingSoonGameProps {
  emoji: string
  title: string
  tagline: string
  onBack: () => void
}

/**
 * Reusable placeholder screen for library cards that are clickable before their
 * game module exists yet (Would You Rather, Jeopardy today). Built on the same
 * GameShell every real game module uses, so swapping this out for the real module
 * later is a drop-in replacement, not a rebuild.
 */
export default function ComingSoonGame({ emoji, title, tagline, onBack }: ComingSoonGameProps) {
  return (
    <GameShell emoji={emoji} title={title} tagline={tagline} tabs={[]} activeTabId="" onTabChange={() => {}} onBack={onBack}>
      <div className="coming-soon-card">
        <div className="deco-blob" style={{ width: 120, height: 120, background: 'var(--sunshine)', opacity: 0.9, top: -50, left: -40 }} />
        <div className="deco-blob" style={{ width: 70, height: 70, background: 'var(--sky-blue)', opacity: 0.85, bottom: -30, right: -20 }} />
        <p className="coming-soon-eyebrow">Up next in the library</p>
        <h2>We're building {title} right now!</h2>
        <p>This game is getting the same Roulette-level polish — check back soon for your turn to play.</p>
      </div>
    </GameShell>
  )
}
