import { useEffect, useState } from 'react'
import ConfettiBurst from '../shared/ConfettiBurst'
import type { ColorThemeId, Participant } from '../shared/types'
import { soundManager } from '../shared/sound'
import type { TtlTimerSeconds, TtlVerdict } from './types'

interface TtlArenaTabProps {
  players: Participant[]
  results: Record<string, TtlVerdict>
  currentIndex: number
  themeId: ColorThemeId
  timerSeconds: TtlTimerSeconds
  onVerdict: (playerId: string, verdict: TtlVerdict) => void
  onNext: () => void
  onPlayAgain: () => void
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Tab 2 — Play Arena. Turn queue on the left, the spotlight card in the middle
 * (current storyteller + verdict buttons), and the lie-detector log on the right.
 * Same 20/50/30 arena layout as Roulette.
 */
export default function TtlArenaTab({ players, results, currentIndex, themeId, timerSeconds, onVerdict, onNext, onPlayAgain }: TtlArenaTabProps) {
  const [burstKey, setBurstKey] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [remaining, setRemaining] = useState<number>(timerSeconds)
  const [timerRunning, setTimerRunning] = useState(false)

  const current = players[currentIndex] ?? null
  const currentVerdict = current ? (results[current.id] ?? null) : null
  const allDone = players.length > 0 && players.every((p) => results[p.id])
  const bluffers = players.filter((p) => results[p.id] === 'fooled')

  // New storyteller: reset the guessing clock and any lingering celebration.
  useEffect(() => {
    setRemaining(timerSeconds)
    setTimerRunning(false)
    setCelebrating(false)
  }, [current?.id, timerSeconds])

  useEffect(() => {
    if (!timerRunning) return
    if (remaining <= 0) {
      setTimerRunning(false)
      soundManager.playTimerUp()
      return
    }
    const t = window.setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => window.clearTimeout(t)
  }, [timerRunning, remaining])

  const handleVerdict = (verdict: TtlVerdict) => {
    if (!current) return
    setTimerRunning(false)
    onVerdict(current.id, verdict)
    if (verdict === 'fooled') {
      soundManager.playWinnerFanfare()
      setCelebrating(true)
      setBurstKey((k) => k + 1)
    } else {
      soundManager.playDrawPop()
    }
  }

  const timesUp = timerSeconds > 0 && remaining <= 0

  return (
    <div className="arena-grid">
      <div className="queue-panel">
        <h3 className="arena-panel-title">🎤 Turn Order</h3>
        <div className="queue-list">
          {players.map((p, i) => {
            const done = Boolean(results[p.id])
            return (
              <div key={p.id} className={`queue-item ${i === currentIndex && !allDone ? 'active' : ''} ${done && i !== currentIndex ? 'won' : ''}`}>
                {p.name}
                {done && <span className="queue-won-mark"> {results[p.id] === 'fooled' ? '😱' : '🕵️'}</span>}
              </div>
            )
          })}
          {players.length === 0 && <p className="queue-empty">Add participants in Customize Game.</p>}
        </div>
      </div>

      <div className="ttl-spotlight-panel">
        {players.length === 0 && <p className="wheel-hint">Everyone needs a turn in the spotlight — add at least 2 participants.</p>}

        {players.length > 0 && allDone && (
          <div className="ttl-spotlight ttl-complete">
            <p className="ttl-spotlight-eyebrow">Game over!</p>
            <h2 className="ttl-spotlight-name">
              {bluffers.length > 0
                ? `🏆 Master Bluffer${bluffers.length > 1 ? 's' : ''}: ${bluffers.map((b) => b.name).join(', ')}`
                : '🕵️ The room caught every single lie!'}
            </h2>
            <p className="ttl-spotlight-instructions">
              {bluffers.length > 0 ? 'The room never saw it coming. Take a bow!' : 'Not one lie survived. Detectives, take a bow!'}
            </p>
            {celebrating && <ConfettiBurst key={burstKey} theme={themeId} pieceCount={64} onDone={() => setCelebrating(false)} />}
            <button type="button" className="btn btn-primary" onClick={onPlayAgain}>
              🔁 Play Again
            </button>
          </div>
        )}

        {current && !allDone && (
          <div className="ttl-spotlight">
            <p className="ttl-spotlight-eyebrow">In the spotlight</p>
            <h2 className="ttl-spotlight-name">🎤 {current.name}</h2>

            {!currentVerdict ? (
              <>
                <p className="ttl-spotlight-instructions">
                  Tell the room <strong>two truths and one lie</strong> — then let them vote on which one is the lie!
                </p>
                {timerSeconds > 0 && (
                  <div className={`wyr-timer ${timesUp ? 'done' : ''}`}>
                    <span className="wyr-timer-clock">{timesUp ? "⏰ Time's up!" : `⏱️ ${formatClock(remaining)}`}</span>
                    {!timerRunning && !timesUp && (
                      <button type="button" className="wyr-timer-btn" onClick={() => setTimerRunning(true)}>
                        {remaining === timerSeconds ? 'Start Timer' : 'Resume'}
                      </button>
                    )}
                    {timerRunning && (
                      <button type="button" className="wyr-timer-btn" onClick={() => setTimerRunning(false)}>
                        Pause
                      </button>
                    )}
                    {(timesUp || remaining !== timerSeconds) && (
                      <button type="button" className="wyr-timer-btn" onClick={() => { setRemaining(timerSeconds); setTimerRunning(false) }}>
                        Reset
                      </button>
                    )}
                  </div>
                )}
                <p className="ttl-verdict-prompt">The votes are in — what happened?</p>
                <div className="ttl-verdict-row">
                  <button type="button" className="btn btn-primary" onClick={() => handleVerdict('fooled')}>
                    😱 They Fooled Us!
                  </button>
                  <button type="button" className="btn btn-sky" onClick={() => handleVerdict('caught')}>
                    🕵️ We Caught the Lie!
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={`ttl-result-chip ${currentVerdict}`}>
                  {currentVerdict === 'fooled' ? '😱 Fooled the whole room!' : '🕵️ The room saw right through it!'}
                </p>
                {celebrating && <ConfettiBurst key={burstKey} theme={themeId} pieceCount={48} onDone={() => setCelebrating(false)} />}
                <button type="button" className="btn btn-primary" onClick={onNext}>
                  Next Player →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="winners-panel">
        <h3 className="arena-panel-title">😱 Bluff Masters</h3>
        <div className="winners-list">
          {bluffers.map((p) => (
            <div className="winner-item" key={p.id}>
              <span className="winner-medal">😱</span>
              <span className="winner-name">{p.name}</span>
            </div>
          ))}
          {bluffers.length === 0 && <p className="winners-empty">Fool the whole room to earn your spot here!</p>}
        </div>
      </div>
    </div>
  )
}
