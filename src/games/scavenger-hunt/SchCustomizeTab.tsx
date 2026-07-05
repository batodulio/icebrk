import { useState } from 'react'
import UtilitySelect from '../shared/UtilitySelect'
import { COLOR_THEME_LIST } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { HUNT_MINUTES_OPTIONS, MAX_ITEMS, type HuntItem, type HuntMinutes } from './types'

interface SchCustomizeTabProps {
  items: HuntItem[]
  onAdd: (text: string) => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  onRestore: () => void
  onClear: () => void
  minutes: HuntMinutes
  onMinutesChange: (value: HuntMinutes) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

// Playful labels per hunt length.
const MINUTES_LABELS: Record<HuntMinutes, string> = {
  0: '🎒 No time limit',
  2: '⚡ 2 minutes',
  5: '🏃 5 minutes',
  10: '🚶 10 minutes',
  15: '🐢 15 minutes',
}

/**
 * Tab 1 — Customize Game: build the hunt list (starter items included, everything
 * editable) and set the countdown + look.
 */
export default function SchCustomizeTab({
  items,
  onAdd,
  onUpdate,
  onRemove,
  onRestore,
  onClear,
  minutes,
  onMinutesChange,
  themeId,
  onThemeChange,
}: SchCustomizeTabProps) {
  const [draft, setDraft] = useState('')

  const isFull = items.length >= MAX_ITEMS
  const canAdd = !isFull && draft.trim().length > 0

  const commitDraft = () => {
    if (!canAdd) return
    onAdd(draft.trim())
    setDraft('')
  }

  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Hunt Timer"
            accent="var(--sky-blue)"
            value={String(minutes)}
            options={HUNT_MINUTES_OPTIONS.map((m) => ({ value: String(m), label: MINUTES_LABELS[m] }))}
            onChange={(value) => onMinutesChange(Number(value) as HuntMinutes)}
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
          <h3>🔍 Hunt List</h3>
          <span className="participant-count-badge">
            {items.length} / {MAX_ITEMS}
          </span>
        </div>
        <p className="customize-card-hint">
          What should the room go find? Keep items findable where you're playing. The starter list works indoors anywhere.
        </p>
        <div className="wyr-add-row">
          <input
            className="wyr-add-input"
            placeholder="Something that sparks joy…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
            disabled={isFull}
          />
        </div>
        <div className="customize-card-actions">
          <button type="button" className="btn btn-primary" onClick={commitDraft} disabled={!canAdd}>
            Add Item
          </button>
          <button type="button" className="wyr-restore-btn" onClick={onRestore}>
            ↺ Restore Starter List
          </button>
          <button type="button" className="wyr-clear-btn" onClick={onClear} disabled={items.length === 0}>
            🗑 Clear All
          </button>
          {isFull && <span className="customize-notice">Maximum of {MAX_ITEMS} items reached.</span>}
        </div>
      </div>

      <div className="wyr-question-list">
        {items.map((item, i) => (
          <div className="wyr-question-row" key={item.id}>
            <span className="wyr-q-num">{i + 1}</span>
            <input
              className="wyr-q-input"
              value={item.text}
              onChange={(e) => onUpdate(item.id, e.target.value)}
              aria-label={`Hunt item ${i + 1}`}
            />
            <button type="button" className="participant-remove" onClick={() => onRemove(item.id)} aria-label={`Remove item ${i + 1}`}>
              ×
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="participant-empty">The hunt list is empty. Add items above or restore the starter list.</p>}
      </div>
    </div>
  )
}
