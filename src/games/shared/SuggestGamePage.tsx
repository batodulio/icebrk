import GameShell from './GameShell'

interface SuggestGamePageProps {
  onBack: () => void
}

/**
 * Route target for the library's "Your Game Here" card — the one slot that isn't a
 * game module. Keeps the card a real navigation destination (consistent with every
 * other card) instead of a dead placeholder.
 */
export default function SuggestGamePage({ onBack }: SuggestGamePageProps) {
  return (
    <GameShell
      emoji="💡"
      title="Your Game Here"
      tagline="Got an idea? We're building the library together"
      tabs={[]}
      activeTabId=""
      onTabChange={() => {}}
      onBack={onBack}
    >
      <div className="coming-soon-card">
        <div className="deco-blob" style={{ width: 120, height: 120, background: 'var(--sunshine)', opacity: 0.9, top: -50, left: -40 }} />
        <div className="deco-blob" style={{ width: 70, height: 70, background: 'var(--vitality-green)', opacity: 0.85, bottom: -30, right: -20 }} />
        <p className="coming-soon-eyebrow">Help us build the library</p>
        <h2>What should we build next?</h2>
        <p>Tell us the game your group loves and we'll turn it into an IceBrk module.</p>
        <p style={{ marginTop: 24 }}>
          <a className="btn btn-yellow" href="mailto:hello@icebrk.app?subject=Game%20idea%20for%20IceBrk">
            Suggest a Game
          </a>
        </p>
      </div>
    </GameShell>
  )
}
