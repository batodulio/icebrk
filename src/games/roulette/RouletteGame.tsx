import { useState } from 'react'
import GameShell from '../shared/GameShell'
import { useParticipants } from '../shared/useParticipants'
import type { GameTabDefinition } from '../shared/types'
import type { ColorThemeId, Participant, Winner } from '../shared/types'
import CustomizeGameTab from './CustomizeGameTab'
import PlayArenaTab from './PlayArenaTab'
import { DEFAULT_SPIN_SECONDS, type SpinSeconds } from './types'

// Two tabs per game: everything you set up lives in Customize Game, everything you
// play lives in Play Arena (the default — players land ready to spin).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

interface RouletteGameProps {
  onExit: () => void
}

/**
 * Roulette — the platform's first fully playable game module. Composes shared
 * infrastructure (GameShell layout, participant model, theming, sound, confetti)
 * that later games (Would You Rather, Jeopardy) should reuse rather than
 * reimplement.
 */
export default function RouletteGame({ onExit }: RouletteGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  const roster = useParticipants()
  const [spinSeconds, setSpinSeconds] = useState<SpinSeconds>(DEFAULT_SPIN_SECONDS)
  const [themeId, setThemeId] = useState<ColorThemeId>('colorful')
  const [spinning, setSpinning] = useState(false)
  const [winners, setWinners] = useState<Winner[]>([])

  // Winners come off the wheel: once someone wins they can't win again. The full
  // roster stays intact (Customize Game keeps everyone), so resetting the winners
  // list puts everybody back in play.
  const wonParticipantIds = new Set(winners.map((w) => w.participantId))
  const eligibleParticipants = roster.participants.filter((p) => !wonParticipantIds.has(p.id))

  const activeWinnerId = winners.length > 0 ? winners[winners.length - 1].participantId : null

  const handleSpinComplete = (winner: Participant) => {
    setSpinning(false)
    setWinners((current) => [...current, { id: crypto.randomUUID(), participantId: winner.id, name: winner.name, place: current.length + 1 }])
  }

  const handleResetWinners = () => setWinners([])

  return (
    <GameShell
      emoji="🎯"
      title="Roulette"
      tagline="Spin the wheel, crown a winner"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
    >
      {activeTab === 'customize' && (
        <CustomizeGameTab
          roster={roster}
          spinSeconds={spinSeconds}
          onSpinSecondsChange={setSpinSeconds}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <PlayArenaTab
          roster={roster.participants}
          eligibleParticipants={eligibleParticipants}
          wonParticipantIds={wonParticipantIds}
          winners={winners}
          activeWinnerId={activeWinnerId}
          spinSeconds={spinSeconds}
          themeId={themeId}
          spinning={spinning}
          onSpinStart={() => setSpinning(true)}
          onSpinComplete={handleSpinComplete}
          onResetWinners={handleResetWinners}
        />
      )}
    </GameShell>
  )
}
