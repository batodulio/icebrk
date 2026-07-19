import { useState } from 'react'
import UtilitySelect from '../shared/UtilitySelect'
import { COLOR_THEME_LIST } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { MAX_QUESTIONS, WYR_TIMER_OPTIONS, type WyrQuestion, type WyrSide, type WyrTimerSeconds } from './types'

interface CustomizeQuestionsTabProps {
  questions: WyrQuestion[]
  onAdd: (a: string, b: string) => void
  onUpdate: (id: string, side: WyrSide, text: string) => void
  onRemove: (id: string) => void
  onShuffle: () => void
  onRestore: () => void
  onClear: () => void
  timerSeconds: WyrTimerSeconds
  onTimerSecondsChange: (value: WyrTimerSeconds) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

// Playful labels per timer length — no timer means free-flowing debate.
const TIMER_LABELS: Record<WyrTimerSeconds, string> = {
  0: '🎙️ No timer',
  30: '⚡ 30 seconds',
  60: '⏳ 60 seconds',
  90: '🐢 90 seconds',
}

/**
 * Tab 1 — Customize Game: the question deck the arena plays through (same
 * "cards you can edit in place" pattern as Roulette's roster) plus the game's
 * settings, built from the shared UtilitySelect block.
 */
export default function CustomizeQuestionsTab({
  questions,
  onAdd,
  onUpdate,
  onRemove,
  onShuffle,
  onRestore,
  onClear,
  timerSeconds,
  onTimerSecondsChange,
  themeId,
  onThemeChange,
}: CustomizeQuestionsTabProps) {
  const [draftA, setDraftA] = useState('')
  const [draftB, setDraftB] = useState('')

  const isFull = questions.length >= MAX_QUESTIONS
  const canAdd = !isFull && draftA.trim().length > 0 && draftB.trim().length > 0

  const commitDraft = () => {
    if (!canAdd) return
    onAdd(draftA.trim(), draftB.trim())
    setDraftA('')
    setDraftB('')
  }

  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Debate Timer"
            accent="var(--sky-blue)"
            value={String(timerSeconds)}
            options={WYR_TIMER_OPTIONS.map((s) => ({ value: String(s), label: TIMER_LABELS[s] }))}
            onChange={(value) => onTimerSecondsChange(Number(value) as WyrTimerSeconds)}
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
          <h3>🃏 Question Deck</h3>
          <span className="participant-count-badge">
            {questions.length} / {MAX_QUESTIONS}
          </span>
        </div>
        <p className="customize-card-hint">
          Write the two sides of a dilemma. The room picks one and defends it. Starter questions are ready below; edit or remove any of them.
        </p>
        <div className="wyr-add-row">
          <input
            className="wyr-add-input"
            placeholder="Would you rather… (side A)"
            value={draftA}
            onChange={(e) => setDraftA(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
            disabled={isFull}
          />
          <span className="wyr-or-chip">or</span>
          <input
            className="wyr-add-input"
            placeholder="…this instead? (side B)"
            value={draftB}
            onChange={(e) => setDraftB(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
            disabled={isFull}
          />
        </div>
        <div className="customize-card-actions">
          <button type="button" className="btn btn-primary" onClick={commitDraft} disabled={!canAdd}>
            Add Question
          </button>
          <button type="button" className="btn btn-sky" onClick={onShuffle} disabled={questions.length < 2}>
            🔀 Shuffle Deck
          </button>
          <button type="button" className="wyr-restore-btn" onClick={onRestore}>
            ↺ Restore Starter Deck
          </button>
          <button type="button" className="wyr-clear-btn" onClick={onClear} disabled={questions.length === 0}>
            🗑 Clear All
          </button>
          {isFull && <span className="customize-notice">Maximum of {MAX_QUESTIONS} questions reached.</span>}
        </div>
      </div>

      <div className="wyr-question-list">
        {questions.map((q, i) => (
          <div className="wyr-question-row" key={q.id}>
            <span className="wyr-q-num">{i + 1}</span>
            <input
              className="wyr-q-input"
              value={q.a}
              onChange={(e) => onUpdate(q.id, 'a', e.target.value)}
              aria-label={`Question ${i + 1} side A`}
            />
            <span className="wyr-or-chip">or</span>
            <input
              className="wyr-q-input"
              value={q.b}
              onChange={(e) => onUpdate(q.id, 'b', e.target.value)}
              aria-label={`Question ${i + 1} side B`}
            />
            <button type="button" className="participant-remove" onClick={() => onRemove(q.id)} aria-label={`Remove question ${i + 1}`}>
              ×
            </button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="participant-empty">The deck is empty. Add a question above or restore the starter deck.</p>
        )}
      </div>
    </div>
  )
}
