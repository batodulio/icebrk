import type { Winner } from '../shared/types'

interface WinnersListProps {
  winners: Winner[]
  /** Clears the winners log and puts everyone back on the wheel. */
  onReset: () => void
}

const PLACE_MEDALS = ['🥇', '🥈', '🥉']

function medalFor(place: number): string {
  return PLACE_MEDALS[place - 1] ?? '🎖️'
}

/** Right column of the Play Arena — chronological winners, newest at the top. */
export default function WinnersList({ winners, onReset }: WinnersListProps) {
  const newestFirst = [...winners].sort((a, b) => b.place - a.place)

  return (
    <div className="winners-panel">
      <div className="winners-panel-head">
        <h3 className="arena-panel-title">🏆 Completed Winners</h3>
        {winners.length > 0 && (
          <button type="button" className="winners-reset" onClick={onReset}>
            ↺ Reset
          </button>
        )}
      </div>
      <div className="winners-list">
        {newestFirst.map((w) => (
          <div className="winner-item" key={w.id}>
            <span className="winner-medal">{medalFor(w.place)}</span>
            <span className="winner-name">{w.name}</span>
          </div>
        ))}
        {winners.length === 0 && <p className="winners-empty">Spin the wheel to crown your first winner!</p>}
      </div>
    </div>
  )
}
