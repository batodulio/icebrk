import UtilitySelect from '../shared/UtilitySelect'
import JpdCluePicture from './JpdCluePicture'
import { COLOR_THEME_LIST } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import {
  CATEGORY_COUNT_OPTIONS,
  JPD_TIMER_OPTIONS,
  MAX_TEAMS,
  ROW_COUNT_OPTIONS,
  type JpdCategory,
  type JpdTeam,
  type JpdTimerSeconds,
} from './types'

// Playful digit emoji for the board-size dropdowns.
const COUNT_EMOJI: Record<number, string> = { 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣' }

// Quick clocks feel zappy, long ones leave room to think.
const TIMER_LABELS: Record<JpdTimerSeconds, string> = {
  5: '⚡ 5 seconds',
  7: '🔥 7 seconds',
  10: '⏱️ 10 seconds',
  15: '⏳ 15 seconds',
  20: '🕰️ 20 seconds',
  25: '🐢 25 seconds',
  0: '♾️ Unli time',
}

interface JpdCustomizeTabProps {
  board: JpdCategory[]
  rowCount: number
  onCategoryCountChange: (count: number) => void
  onRowCountChange: (count: number) => void
  onCategoryName: (categoryId: string, name: string) => void
  onClueText: (categoryId: string, clueId: string, field: 'question' | 'answer', text: string) => void
  onClueImage: (categoryId: string, clueId: string, image: string | undefined) => void
  onRestoreBoard: () => void
  onClearBoard: () => void
  teams: JpdTeam[]
  onAddTeam: () => void
  onTeamName: (teamId: string, name: string) => void
  onRemoveTeam: (teamId: string) => void
  timerSeconds: JpdTimerSeconds
  onTimerSecondsChange: (value: JpdTimerSeconds) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

/**
 * Tab 1 — Customize Game: edit every category name, question, and answer on the
 * 4×4 board, manage the competing teams, and set the game's look.
 */
export default function JpdCustomizeTab({
  board,
  rowCount,
  onCategoryCountChange,
  onRowCountChange,
  onCategoryName,
  onClueText,
  onClueImage,
  onRestoreBoard,
  onClearBoard,
  teams,
  onAddTeam,
  onTeamName,
  onRemoveTeam,
  timerSeconds,
  onTimerSecondsChange,
  themeId,
  onThemeChange,
}: JpdCustomizeTabProps) {
  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Categories"
            accent="var(--sky-blue)"
            value={String(board.length)}
            options={CATEGORY_COUNT_OPTIONS.map((n) => ({ value: String(n), label: `${COUNT_EMOJI[n]} ${n} categories` }))}
            onChange={(value) => onCategoryCountChange(Number(value))}
          />
          <UtilitySelect
            label="Questions Each"
            accent="var(--vitality-green)"
            value={String(rowCount)}
            options={ROW_COUNT_OPTIONS.map((n) => ({ value: String(n), label: `${COUNT_EMOJI[n]} ${n} questions` }))}
            onChange={(value) => onRowCountChange(Number(value))}
          />
          <UtilitySelect
            label="Answer Timer"
            accent="var(--energy-orange)"
            value={String(timerSeconds)}
            options={JPD_TIMER_OPTIONS.map((s) => ({ value: String(s), label: TIMER_LABELS[s] }))}
            onChange={(value) => onTimerSecondsChange(Number(value) as JpdTimerSeconds)}
          />
          <UtilitySelect
            label="Color Theme"
            accent="var(--purple)"
            value={themeId}
            options={COLOR_THEME_LIST.map((t) => ({ value: t.id, label: `${t.emoji} ${t.label}` }))}
            onChange={(value) => onThemeChange(value as ColorThemeId)}
          />
        </div>
      </div>

      <div className="customize-card">
        <div className="customize-card-head">
          <h3>🏅 Teams</h3>
          <span className="participant-count-badge">
            {teams.length} / {MAX_TEAMS}
          </span>
        </div>
        <p className="customize-card-hint">Name the teams battling on the board. Scores are tracked in the Play Arena.</p>
        <div className="participant-grid">
          {teams.map((t) => (
            <div className="participant-card" key={t.id}>
              <input
                className="participant-name-input"
                value={t.name}
                onChange={(e) => onTeamName(t.id, e.target.value)}
                aria-label="Team name"
              />
              <button
                type="button"
                className="participant-remove"
                onClick={() => onRemoveTeam(t.id)}
                aria-label={`Remove ${t.name}`}
                disabled={teams.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="customize-card-actions">
          <button type="button" className="btn btn-primary" onClick={onAddTeam} disabled={teams.length >= MAX_TEAMS}>
            Add Team
          </button>
        </div>
      </div>

      <div className="customize-card">
        <div className="customize-card-head">
          <h3>🧠 Board Questions</h3>
          <div className="customize-head-actions">
            <button type="button" className="wyr-restore-btn" onClick={onRestoreBoard}>
              ↺ Restore Starter Board
            </button>
            <button type="button" className="wyr-clear-btn" onClick={onClearBoard}>
              🗑 Clear All
            </button>
          </div>
        </div>
        <p className="customize-card-hint">
          Size the board in Game Settings above, then edit anything here. Add a picture to any question for a guess-the-brand round. The answer stays hidden until you reveal it in the arena.
        </p>
        <div className="jpd-category-grid">
          {board.map((cat) => (
            <div className="jpd-category-card" key={cat.id}>
              <input
                className="jpd-category-name"
                value={cat.name}
                onChange={(e) => onCategoryName(cat.id, e.target.value)}
                aria-label="Category name"
              />
              {cat.clues.map((clue) => (
                <div className="jpd-clue-row" key={clue.id}>
                  <span className="jpd-clue-points">{clue.points}</span>
                  <div className="jpd-clue-fields">
                    <input
                      className="jpd-clue-input"
                      value={clue.question}
                      onChange={(e) => onClueText(cat.id, clue.id, 'question', e.target.value)}
                      aria-label={`${cat.name} ${clue.points} question`}
                      placeholder="Question"
                    />
                    <input
                      className="jpd-clue-input jpd-clue-answer"
                      value={clue.answer}
                      onChange={(e) => onClueText(cat.id, clue.id, 'answer', e.target.value)}
                      aria-label={`${cat.name} ${clue.points} answer`}
                      placeholder="Answer"
                    />
                    <JpdCluePicture
                      image={clue.image}
                      clueLabel={`${cat.name} ${clue.points}`}
                      onChange={(image) => onClueImage(cat.id, clue.id, image)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
