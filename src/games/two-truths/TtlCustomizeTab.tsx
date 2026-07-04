import type { UseParticipantsResult } from '../shared/useParticipants'
import RosterEditor from '../shared/RosterEditor'
import UtilitySelect from '../shared/UtilitySelect'
import { COLOR_THEME_LIST } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { TTL_TIMER_OPTIONS, type TtlTimerSeconds } from './types'

interface TtlCustomizeTabProps {
  roster: UseParticipantsResult
  timerSeconds: TtlTimerSeconds
  onTimerSecondsChange: (value: TtlTimerSeconds) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

// Playful labels per guessing-timer length.
const TIMER_LABELS: Record<TtlTimerSeconds, string> = {
  0: '🎙️ No timer',
  30: '⚡ 30 seconds',
  60: '⏳ 60 seconds',
  90: '🐢 90 seconds',
}

/**
 * Tab 1 — Customize Game: who's playing (shared RosterEditor — each person gets one
 * spotlight turn) plus the game's settings.
 */
export default function TtlCustomizeTab({ roster, timerSeconds, onTimerSecondsChange, themeId, onThemeChange }: TtlCustomizeTabProps) {
  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Guessing Timer"
            accent="var(--sky-blue)"
            value={String(timerSeconds)}
            options={TTL_TIMER_OPTIONS.map((s) => ({ value: String(s), label: TIMER_LABELS[s] }))}
            onChange={(value) => onTimerSecondsChange(Number(value) as TtlTimerSeconds)}
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
