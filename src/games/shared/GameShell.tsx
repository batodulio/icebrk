import type { ReactNode } from 'react'
import type { GameTabDefinition } from './types'

interface GameShellProps {
  emoji: string
  title: string
  tagline: string
  tabs: GameTabDefinition[]
  activeTabId: string
  onTabChange: (id: string) => void
  onBack: () => void
  children: ReactNode
}

/**
 * Shared page chrome for every game module: back-to-library nav, game header, and
 * the full-width tab strip (Customize Game / Play Arena). Game modules own their own
 * tab state and content — this component
 * only renders the surrounding layout so every game feels consistent without
 * duplicating this shell per game.
 */
export default function GameShell({ emoji, title, tagline, tabs, activeTabId, onTabChange, onBack, children }: GameShellProps) {
  return (
    <div className="game-shell">
      {/* Floating brand-colored shapes so game pages feel like the landing page's
          playful world instead of a plain white app screen. */}
      <div className="game-shell-deco" aria-hidden="true">
        <span className="gs-blob gs-blob-1" />
        <span className="gs-blob gs-blob-2" />
        <span className="gs-blob gs-blob-3" />
        <span className="gs-blob gs-blob-4" />
        <span className="gs-confetti gs-c1" />
        <span className="gs-confetti gs-c2" />
        <span className="gs-confetti gs-c3" />
        <span className="gs-confetti gs-tri" />
      </div>
      <div className="wrap game-shell-inner">
        <button type="button" className="game-shell-back" onClick={onBack}>
          ← Game Library
        </button>

        <div className="game-shell-header">
          <span className="game-shell-emoji">{emoji}</span>
          <div>
            <h1 className="game-shell-title">{title}</h1>
            <p className="game-shell-tagline">{tagline}</p>
          </div>
        </div>

        {tabs.length > 0 && (
          <div className="game-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabId}
                className={`game-tab ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="game-shell-body">{children}</div>
      </div>
    </div>
  )
}
