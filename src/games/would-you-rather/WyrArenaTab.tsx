import { useEffect, useState } from 'react'
import ConfettiBurst from '../shared/ConfettiBurst'
import { COLOR_THEMES, wedgeTextColor } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { soundManager } from '../shared/sound'
import type { WyrQuestion, WyrSide, WyrTimerSeconds } from './types'

interface WyrArenaTabProps {
  question: WyrQuestion | null
  index: number
  total: number
  pick: WyrSide | null
  tally: { a: number; b: number }
  themeId: ColorThemeId
  timerSeconds: WyrTimerSeconds
  onPick: (questionId: string, side: WyrSide) => void
  onPrev: () => void
  onNext: () => void
  onRestart: () => void
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Tab — Play Arena. One dilemma at a time as a two-card face-off: the room debates,
 * then the host taps the side that won the argument. Confetti + fanfare come from
 * the same shared systems Roulette uses.
 */
export default function WyrArenaTab({
  question,
  index,
  total,
  pick,
  tally,
  themeId,
  timerSeconds,
  onPick,
  onPrev,
  onNext,
  onRestart,
}: WyrArenaTabProps) {
  const [burst, setBurst] = useState<{ side: WyrSide; key: number } | null>(null)
  const [remaining, setRemaining] = useState<number>(timerSeconds)
  const [timerRunning, setTimerRunning] = useState(false)

  const theme = COLOR_THEMES[themeId]
  const paletteSize = theme.colors.length
  // Rotate the pair of card colors per question so the arena stays lively deck-long.
  const colorA = theme.colors[(index * 2) % paletteSize]
  const colorB = theme.colors[(index * 2 + 1) % paletteSize]

  // New question or new timer setting: clear celebration + reset the clock.
  useEffect(() => {
    setBurst(null)
    setRemaining(timerSeconds)
    setTimerRunning(false)
  }, [question?.id, timerSeconds])

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

  if (!question) {
    return (
      <div className="wyr-arena">
        <p className="wheel-hint">The deck is empty — add questions in Customize Game to start the debate.</p>
      </div>
    )
  }

  const handlePick = (side: WyrSide) => {
    onPick(question.id, side)
    soundManager.playWinnerFanfare()
    setBurst((current) => ({ side, key: (current?.key ?? 0) + 1 }))
  }

  const isLast = index >= total - 1
  const timesUp = timerSeconds > 0 && remaining <= 0

  return (
    <div className="wyr-arena">
      <div className="wyr-topline">
        <span className="wyr-progress">
          Question {index + 1} of {total}
        </span>
        <div className="wyr-tally" title="Sides picked so far">
          <span className="wyr-tally-chip">🅰️ {tally.a}</span>
          <span className="wyr-tally-chip">🅱️ {tally.b}</span>
        </div>
      </div>

      <h2 className="wyr-title">Would you rather…</h2>

      <div className="wyr-faceoff">
        <button
          type="button"
          className={`wyr-card ${pick === 'a' ? 'picked' : ''} ${pick === 'b' ? 'dimmed' : ''}`}
          style={{ background: colorA, color: wedgeTextColor(theme, colorA) }}
          onClick={() => handlePick('a')}
        >
          <span className="wyr-side-letter">A</span>
          {question.a}
          {burst?.side === 'a' && <ConfettiBurst key={burst.key} theme={themeId} pieceCount={32} onDone={() => setBurst(null)} />}
        </button>
        <div className="wyr-or" aria-hidden="true">OR</div>
        <button
          type="button"
          className={`wyr-card ${pick === 'b' ? 'picked' : ''} ${pick === 'a' ? 'dimmed' : ''}`}
          style={{ background: colorB, color: wedgeTextColor(theme, colorB) }}
          onClick={() => handlePick('b')}
        >
          <span className="wyr-side-letter">B</span>
          {question.b}
          {burst?.side === 'b' && <ConfettiBurst key={burst.key} theme={themeId} pieceCount={32} onDone={() => setBurst(null)} />}
        </button>
      </div>

      <p className="wyr-instruction">
        {pick ? 'Side picked — change it or move on!' : 'Debate it out, then tap the side that wins the room.'}
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
            <button
              type="button"
              className="wyr-timer-btn"
              onClick={() => {
                setRemaining(timerSeconds)
                setTimerRunning(false)
              }}
            >
              Reset
            </button>
          )}
        </div>
      )}

      <div className="wyr-controls">
        <button type="button" className="btn btn-yellow" onClick={onPrev} disabled={index === 0}>
          ← Previous
        </button>
        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            🔁 Restart Deck
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Next Question →
          </button>
        )}
      </div>
    </div>
  )
}
