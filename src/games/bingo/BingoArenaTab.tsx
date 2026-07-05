import { useEffect, useState } from 'react'
import ConfettiBurst from '../shared/ConfettiBurst'
import { COLOR_THEMES, wedgeTextColor } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { soundManager } from '../shared/sound'
import { BINGO_LETTERS, NUMBERS_PER_LETTER, TOTAL_NUMBERS, callLabel, letterIndexFor, type AutoCallSeconds } from './types'

interface BingoArenaTabProps {
  calledNumbers: number[]
  themeId: ColorThemeId
  autoCallSeconds: AutoCallSeconds
  onDraw: () => void
  onReset: () => void
}

/**
 * Tab 2 — Play Arena. The caller screen the host projects: the current ball big in
 * the middle, the full 75-number tracking board below, and the BINGO! button for
 * when someone in the room shouts it.
 */
export default function BingoArenaTab({ calledNumbers, themeId, autoCallSeconds, onDraw, onReset }: BingoArenaTabProps) {
  const [autoRunning, setAutoRunning] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [burstKey, setBurstKey] = useState(0)

  const theme = COLOR_THEMES[themeId]
  const called = new Set(calledNumbers)
  const current = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null
  const recent = calledNumbers.slice(-6, -1).reverse()
  const exhausted = calledNumbers.length >= TOTAL_NUMBERS

  // Auto-call: draw again N seconds after the latest call while running.
  useEffect(() => {
    if (!autoRunning || autoCallSeconds === 0 || exhausted || celebrating) return
    const t = window.setTimeout(onDraw, autoCallSeconds * 1000)
    return () => window.clearTimeout(t)
  }, [autoRunning, autoCallSeconds, exhausted, celebrating, calledNumbers.length, onDraw])

  // Changing the pace setting back to manual stops any running auto-call.
  useEffect(() => {
    if (autoCallSeconds === 0) setAutoRunning(false)
  }, [autoCallSeconds])

  const currentColor = current !== null ? theme.colors[letterIndexFor(current) % theme.colors.length] : 'var(--mist)'

  const handleBingo = () => {
    setAutoRunning(false)
    soundManager.playWinnerFanfare()
    setCelebrating(true)
    setBurstKey((k) => k + 1)
  }

  const handleReset = () => {
    setAutoRunning(false)
    setCelebrating(false)
    onReset()
  }

  return (
    <div className="bng-arena">
      <div className="bng-topline">
        <span className="wyr-progress">
          {calledNumbers.length} of {TOTAL_NUMBERS} called
        </span>
        <button type="button" className="winners-reset" onClick={handleReset}>
          <span className="reset-icon" aria-hidden="true">↺</span> Reset Game
        </button>
      </div>

      <div className="bng-caller">
        <div className="bng-ball-stage">
          <div
            className={`bng-ball ${current === null ? 'empty' : ''}`}
            style={current === null ? undefined : { background: currentColor, color: wedgeTextColor(theme, currentColor) }}
          >
            {current === null ? 'Ready?' : callLabel(current)}
          </div>
          {celebrating && <ConfettiBurst key={burstKey} theme={themeId} pieceCount={80} onDone={() => setCelebrating(false)} />}
        </div>

        {recent.length > 0 && (
          <div className="bng-recent" aria-label="Recent calls">
            {recent.map((n) => (
              <span className="bng-recent-chip" key={n}>
                {callLabel(n)}
              </span>
            ))}
          </div>
        )}

        <div className="bng-controls">
          <button type="button" className="btn btn-primary" onClick={onDraw} disabled={exhausted}>
            {exhausted ? 'All Numbers Called!' : current === null ? 'Call First Number' : 'Call Next Number'}
          </button>
          {autoCallSeconds > 0 && !exhausted && (
            <button type="button" className="btn btn-sky" onClick={() => setAutoRunning((r) => !r)}>
              {autoRunning ? '⏸ Pause Auto-Call' : `▶ Auto-Call (${autoCallSeconds}s)`}
            </button>
          )}
          <button type="button" className="btn btn-yellow" onClick={handleBingo} disabled={calledNumbers.length === 0}>
            📣 BINGO!
          </button>
        </div>
        {celebrating && <p className="wheel-winner-line">🎉 We have a BINGO! Check that card! 🎉</p>}
      </div>

      <div className="bng-board">
        {BINGO_LETTERS.map((letter, row) => {
          const rowColor = theme.colors[row % theme.colors.length]
          return (
            <div className="bng-board-row" key={letter}>
              <span className="bng-board-letter" style={{ background: rowColor, color: wedgeTextColor(theme, rowColor) }}>
                {letter}
              </span>
              {Array.from({ length: NUMBERS_PER_LETTER }, (_, i) => {
                const n = row * NUMBERS_PER_LETTER + i + 1
                const isCalled = called.has(n)
                const isCurrent = n === current
                return (
                  <span
                    className={`bng-board-cell ${isCalled ? 'called' : ''} ${isCurrent ? 'current' : ''}`}
                    style={isCalled ? { background: rowColor, color: wedgeTextColor(theme, rowColor) } : undefined}
                    key={n}
                  >
                    {n}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
