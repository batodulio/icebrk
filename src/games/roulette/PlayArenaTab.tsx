import type { Participant, Winner } from '../shared/types'
import type { ColorThemeId } from '../shared/types'
import ParticipantQueue from './ParticipantQueue'
import RouletteWheel from './RouletteWheel'
import WinnersList from './WinnersList'
import type { SpinSeconds } from './types'

interface PlayArenaTabProps {
  /** Everyone in the game — shown in the queue, with past winners dimmed. */
  roster: Participant[]
  /** Roster minus past winners — only these are on the wheel. */
  eligibleParticipants: Participant[]
  wonParticipantIds: Set<string>
  winners: Winner[]
  activeWinnerId: string | null
  spinSeconds: SpinSeconds
  themeId: ColorThemeId
  spinning: boolean
  onSpinStart: () => void
  onSpinComplete: (winner: Participant) => void
  onResetWinners: () => void
}

/** Tab 3 — Play Arena. Full-width 20/50/30 layout: queue, wheel, winners. */
export default function PlayArenaTab({
  roster,
  eligibleParticipants,
  wonParticipantIds,
  winners,
  activeWinnerId,
  spinSeconds,
  themeId,
  spinning,
  onSpinStart,
  onSpinComplete,
  onResetWinners,
}: PlayArenaTabProps) {
  const everyoneHasWon = roster.length >= 2 && eligibleParticipants.length < 2 && winners.length > 0
  return (
    <div className="arena-grid">
      <ParticipantQueue participants={roster} wonParticipantIds={wonParticipantIds} activeWinnerId={activeWinnerId} />
      <RouletteWheel
        participants={eligibleParticipants}
        spinSeconds={spinSeconds}
        themeId={themeId}
        spinning={spinning}
        emptyHint={everyoneHasWon ? 'Everyone has had their moment — reset the winners to spin again!' : undefined}
        onSpinStart={onSpinStart}
        onSpinComplete={onSpinComplete}
      />
      <WinnersList winners={winners} onReset={onResetWinners} />
    </div>
  )
}
