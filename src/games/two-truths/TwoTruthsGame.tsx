import { useState } from 'react'
import GameShell from '../shared/GameShell'
import { useParticipants } from '../shared/useParticipants'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import TtlCustomizeTab from './TtlCustomizeTab'
import TtlArenaTab from './TtlArenaTab'
import { DEFAULT_TTL_TIMER, type TtlTimerSeconds, type TtlVerdict } from './types'

// Two tabs per game module: set up in Customize Game, play in Play Arena (default).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

interface TwoTruthsGameProps {
  onExit: () => void
}

/**
 * Two Truths & a Lie — spotlight icebreaker. Each player tells two truths and one
 * lie out loud; the room votes; the host records whether the storyteller fooled
 * everyone. Best bluffers get the glory at the end.
 */
export default function TwoTruthsGame({ onExit }: TwoTruthsGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  const roster = useParticipants()
  const [turnIndex, setTurnIndex] = useState(0)
  const [results, setResults] = useState<Record<string, TtlVerdict>>({})
  const [timerSeconds, setTimerSeconds] = useState<TtlTimerSeconds>(DEFAULT_TTL_TIMER)
  const [themeId, setThemeId] = useState<ColorThemeId>('colorful')

  const players = roster.participants
  // Roster edits can shrink the list mid-game — clamp instead of storing a stale index.
  const safeIndex = players.length > 0 ? Math.min(turnIndex, players.length - 1) : 0

  const recordVerdict = (playerId: string, verdict: TtlVerdict) => {
    setResults((current) => ({ ...current, [playerId]: verdict }))
  }

  // Advance to the next player still waiting for a turn, scanning forward first so
  // the queue plays top to bottom even if someone was skipped or added late.
  const nextTurn = () => {
    const after = players.findIndex((p, i) => i > safeIndex && !results[p.id])
    if (after !== -1) {
      setTurnIndex(after)
      return
    }
    const anywhere = players.findIndex((p) => !results[p.id])
    if (anywhere !== -1) setTurnIndex(anywhere)
  }

  const playAgain = () => {
    setResults({})
    setTurnIndex(0)
  }

  return (
    <GameShell
      emoji="🤥"
      title="Two Truths & a Lie"
      tagline="Guess what's real"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
    >
      {activeTab === 'customize' && (
        <TtlCustomizeTab
          roster={roster}
          timerSeconds={timerSeconds}
          onTimerSecondsChange={setTimerSeconds}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <TtlArenaTab
          players={players}
          results={results}
          currentIndex={safeIndex}
          themeId={themeId}
          timerSeconds={timerSeconds}
          onVerdict={recordVerdict}
          onNext={nextTurn}
          onPlayAgain={playAgain}
        />
      )}
    </GameShell>
  )
}
