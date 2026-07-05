import { useEffect, useRef, useState } from 'react'
import ConfettiBurst from '../shared/ConfettiBurst'
import { COLOR_THEMES, wedgeTextColor } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { soundManager } from '../shared/sound'
import type { HuntItem, HuntMinutes } from './types'

interface SchArenaTabProps {
  items: HuntItem[]
  foundIds: Set<string>
  themeId: ColorThemeId
  minutes: HuntMinutes
  onToggleFound: (itemId: string) => void
  onReset: () => void
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Tab 2 — Play Arena. The projected hunt board: countdown on top, the item grid
 * below. The host taps an item when someone brings it in; finding everything
 * before the buzzer earns the big celebration.
 */
export default function SchArenaTab({ items, foundIds, themeId, minutes, onToggleFound, onReset }: SchArenaTabProps) {
  const totalSeconds = minutes * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [timerRunning, setTimerRunning] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [burstKey, setBurstKey] = useState(0)

  const theme = COLOR_THEMES[themeId]
  const foundCount = items.filter((i) => foundIds.has(i.id)).length
  const complete = items.length > 0 && foundCount === items.length
  const timesUp = minutes > 0 && remaining <= 0 && !complete

  useEffect(() => {
    setRemaining(totalSeconds)
    setTimerRunning(false)
  }, [totalSeconds])

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

  // Fire the celebration exactly once when the last item is found.
  const celebratedRef = useRef(false)
  useEffect(() => {
    if (complete && !celebratedRef.current) {
      celebratedRef.current = true
      setTimerRunning(false)
      soundManager.playWinnerFanfare()
      setCelebrating(true)
      setBurstKey((k) => k + 1)
    }
    if (!complete) celebratedRef.current = false
  }, [complete])

  const handleToggle = (item: HuntItem) => {
    if (!foundIds.has(item.id)) soundManager.playDrawPop()
    onToggleFound(item.id)
  }

  const handleReset = () => {
    setRemaining(totalSeconds)
    setTimerRunning(false)
    setCelebrating(false)
    onReset()
  }

  if (items.length === 0) {
    return (
      <div className="sch-arena">
        <p className="wheel-hint">The hunt list is empty. Add items in Customize Game to start the hunt.</p>
      </div>
    )
  }

  return (
    <div className="sch-arena">
      <div className="bng-topline">
        <span className="wyr-progress">
          {foundCount} of {items.length} found
        </span>
        <button type="button" className="winners-reset" onClick={handleReset}>
          <span className="reset-icon" aria-hidden="true">↺</span> Reset Hunt
        </button>
      </div>

      {minutes > 0 && !complete && (
        <div className={`wyr-timer sch-timer ${timesUp ? 'done' : ''}`}>
          <span className="wyr-timer-clock">{timesUp ? "⏰ Time's up!" : `⏱️ ${formatClock(remaining)}`}</span>
          {!timerRunning && !timesUp && (
            <button type="button" className="wyr-timer-btn" onClick={() => setTimerRunning(true)}>
              {remaining === totalSeconds ? 'Start the Hunt' : 'Resume'}
            </button>
          )}
          {timerRunning && (
            <button type="button" className="wyr-timer-btn" onClick={() => setTimerRunning(false)}>
              Pause
            </button>
          )}
          {(timesUp || remaining !== totalSeconds) && (
            <button type="button" className="wyr-timer-btn" onClick={() => { setRemaining(totalSeconds); setTimerRunning(false) }}>
              Reset
            </button>
          )}
        </div>
      )}

      {complete && (
        <div className="jpd-winner-banner">
          🎉 Hunt complete, you found everything! 🎉
          {celebrating && <ConfettiBurst key={burstKey} theme={themeId} pieceCount={64} onDone={() => setCelebrating(false)} />}
        </div>
      )}
      {timesUp && (
        <div className="sch-timesup-banner">
          ⏰ Time's up! The room tracked down {foundCount} of {items.length} items.
        </div>
      )}

      <div className="sch-item-grid">
        {items.map((item, i) => {
          const found = foundIds.has(item.id)
          const color = theme.colors[i % theme.colors.length]
          return (
            <button
              type="button"
              key={item.id}
              className={`sch-item ${found ? 'found' : ''}`}
              style={found ? { background: color, color: wedgeTextColor(theme, color) } : undefined}
              onClick={() => handleToggle(item)}
              aria-pressed={found}
            >
              <span className="sch-item-mark">{found ? '✓' : '🔍'}</span>
              {item.text}
            </button>
          )
        })}
      </div>
      <p className="wyr-instruction">Tap an item when someone brings it in. Tap again to undo.</p>
    </div>
  )
}
