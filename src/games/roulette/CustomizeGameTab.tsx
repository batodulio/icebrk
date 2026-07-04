import type { UseParticipantsResult } from '../shared/useParticipants'
import RosterEditor from '../shared/RosterEditor'
import UtilitySelect from '../shared/UtilitySelect'
import { COLOR_THEME_LIST } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { SPIN_SECONDS_OPTIONS, type SpinSeconds } from './types'

interface CustomizeGameTabProps {
  roster: UseParticipantsResult
  spinSeconds: SpinSeconds
  onSpinSecondsChange: (value: SpinSeconds) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

// Playful emoji per spin length — quick spins feel zappy, long spins feel sloth-y.
const SPIN_EMOJI: Record<SpinSeconds, string> = {
  5: '⚡',
  10: '🚀',
  15: '🎈',
  20: '🐢',
  25: '🦥',
}

/**
 * Tab 1 — Customize Game: the participant roster (shared RosterEditor) plus the
 * game's settings, built from the shared UtilitySelect block.
 */
export default function CustomizeGameTab({ roster, spinSeconds, onSpinSecondsChange, themeId, onThemeChange }: CustomizeGameTabProps) {
  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Spin Timer"
            accent="var(--sky-blue)"
            value={String(spinSeconds)}
            options={SPIN_SECONDS_OPTIONS.map((s) => ({ value: String(s), label: `${SPIN_EMOJI[s]} ${s} seconds` }))}
            onChange={(value) => onSpinSecondsChange(Number(value) as SpinSeconds)}
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

      <RosterEditor roster={roster} />
    </div>
  )
}
