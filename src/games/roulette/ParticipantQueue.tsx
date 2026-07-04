import type { Participant } from '../shared/types'

interface ParticipantQueueProps {
  participants: Participant[]
  /** Participants who already won — shown crossed out so the roster stays visible. */
  wonParticipantIds: Set<string>
  activeWinnerId: string | null
}

/** Left column of the Play Arena — scrollable roster with the current winner highlighted. */
export default function ParticipantQueue({ participants, wonParticipantIds, activeWinnerId }: ParticipantQueueProps) {
  return (
    <div className="queue-panel">
      <h3 className="arena-panel-title">🎟️ Participants</h3>
      <div className="queue-list">
        {participants.map((p) => {
          const won = wonParticipantIds.has(p.id)
          const active = p.id === activeWinnerId
          return (
            <div key={p.id} className={`queue-item ${active ? 'active' : ''} ${won && !active ? 'won' : ''}`}>
              {p.name}
              {won && <span className="queue-won-mark" aria-label="Already won"> 🏆</span>}
            </div>
          )
        })}
        {participants.length === 0 && <p className="queue-empty">Add participants in Customize Game.</p>}
      </div>
    </div>
  )
}
