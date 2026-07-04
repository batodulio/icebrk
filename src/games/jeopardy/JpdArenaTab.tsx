import { useEffect, useRef, useState } from 'react'
import ConfettiBurst from '../shared/ConfettiBurst'
import { COLOR_THEMES, wedgeTextColor } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { soundManager } from '../shared/sound'
import type { JpdCategory, JpdClue, JpdTeam } from './types'

interface ActiveClue {
  category: JpdCategory
  clue: JpdClue
}

interface JpdArenaTabProps {
  board: JpdCategory[]
  usedClueIds: Set<string>
  teams: JpdTeam[]
  themeId: ColorThemeId
  onAward: (teamId: string, points: number, clueId: string) => void
  onNoAnswer: (clueId: string) => void
  onRestart: () => void
}

/**
 * Tab 2 — Play Arena. The projected quiz board: scoreboard on top, the 4×4 grid
 * below. Tapping a cell opens the clue overlay; the host reveals the answer and
 * awards the points. When the board is cleared, the leading team gets the big
 * confetti moment.
 */
export default function JpdArenaTab({ board, usedClueIds, teams, themeId, onAward, onNoAnswer, onRestart }: JpdArenaTabProps) {
  const [active, setActive] = useState<ActiveClue | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const [celebrating, setCelebrating] = useState(false)

  const theme = COLOR_THEMES[themeId]
  const totalClues = board.reduce((sum, cat) => sum + cat.clues.length, 0)
  // Count only clues currently on the board — resizing it smaller can leave stale
  // ids in usedClueIds, which must not fake a completed board.
  const usedCount = board.reduce((sum, cat) => sum + cat.clues.filter((c) => usedClueIds.has(c.id)).length, 0)
  const complete = totalClues > 0 && usedCount >= totalClues

  const topScore = Math.max(...teams.map((t) => t.score), 0)
  const champions = teams.filter((t) => t.score === topScore && topScore > 0)

  // Fire the fanfare + confetti exactly once when the last clue gets used.
  const celebratedRef = useRef(false)
  useEffect(() => {
    if (complete && !celebratedRef.current) {
      celebratedRef.current = true
      soundManager.playWinnerFanfare()
      setCelebrating(true)
      setBurstKey((k) => k + 1)
    }
    if (!complete) celebratedRef.current = false
  }, [complete])

  const openClue = (category: JpdCategory, clue: JpdClue) => {
    if (usedClueIds.has(clue.id)) return
    setActive({ category, clue })
    setRevealed(false)
  }

  const closeOverlay = () => {
    setActive(null)
    setRevealed(false)
  }

  const handleReveal = () => {
    setRevealed(true)
    soundManager.playDrawPop()
  }

  const handleAward = (teamId: string) => {
    if (!active) return
    soundManager.playWinnerFanfare()
    onAward(teamId, active.clue.points, active.clue.id)
    closeOverlay()
  }

  const handleNoAnswer = () => {
    if (!active) return
    onNoAnswer(active.clue.id)
    closeOverlay()
  }

  return (
    <div className="jpd-arena">
      <div className="jpd-scoreboard">
        {teams.map((t) => {
          const leading = t.score === topScore && topScore > 0
          return (
            <div className={`jpd-score-chip ${leading ? 'leading' : ''}`} key={t.id}>
              <span className="jpd-score-name">
                {leading && '👑 '}
                {t.name}
              </span>
              <span className="jpd-score-points">{t.score}</span>
            </div>
          )
        })}
        <button type="button" className="winners-reset" onClick={() => { setCelebrating(false); onRestart() }}>
          ↺ Restart Game
        </button>
      </div>

      {complete && (
        <div className="jpd-winner-banner">
          🎉 {champions.length > 1 ? `It's a tie — ${champions.map((c) => c.name).join(' & ')}!` : champions.length === 1 ? `${champions[0].name} wins the board!` : 'Board cleared!'} 🎉
          {celebrating && <ConfettiBurst key={burstKey} theme={themeId} pieceCount={64} onDone={() => setCelebrating(false)} />}
        </div>
      )}

      <div className="jpd-board" style={{ gridTemplateColumns: `repeat(${board.length}, 1fr)` }}>
        {board.map((cat) => (
          <div className="jpd-board-header" key={cat.id}>
            {cat.name}
          </div>
        ))}
        {board[0]?.clues.map((_, rowIndex) =>
          board.map((cat, colIndex) => {
            const clue = cat.clues[rowIndex]
            const used = usedClueIds.has(clue.id)
            const color = theme.colors[colIndex % theme.colors.length]
            return (
              <button
                type="button"
                key={clue.id}
                className={`jpd-cell ${used ? 'used' : ''}`}
                style={used ? undefined : { background: color, color: wedgeTextColor(theme, color) }}
                onClick={() => openClue(cat, clue)}
                disabled={used}
              >
                {used ? '✓' : clue.points}
              </button>
            )
          }),
        )}
      </div>

      {active && (
        <div className="jpd-overlay" role="dialog" aria-modal="true" aria-label={`${active.category.name} for ${active.clue.points}`}>
          <div className="jpd-overlay-card">
            <p className="jpd-overlay-head">
              {active.category.name} · {active.clue.points} points
            </p>
            <p className="jpd-overlay-question">{active.clue.question}</p>
            {revealed && <p className="jpd-overlay-answer">💡 {active.clue.answer}</p>}

            {!revealed ? (
              <div className="jpd-overlay-actions">
                <button type="button" className="btn btn-primary" onClick={handleReveal}>
                  Reveal Answer
                </button>
                <button type="button" className="btn btn-yellow" onClick={closeOverlay}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="jpd-overlay-actions">
                <p className="jpd-overlay-prompt">Who got it right?</p>
                <div className="jpd-award-row">
                  {teams.map((t) => (
                    <button type="button" className="btn btn-sky jpd-award-btn" key={t.id} onClick={() => handleAward(t.id)}>
                      {t.name} +{active.clue.points}
                    </button>
                  ))}
                  <button type="button" className="btn btn-yellow" onClick={handleNoAnswer}>
                    No One Got It
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
