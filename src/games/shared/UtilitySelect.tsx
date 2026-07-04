interface UtilitySelectOption {
  value: string
  label: string
}

interface UtilitySelectProps {
  label: string
  /** CSS variable (e.g. 'var(--sky-blue)') used for the card's accent border — lets each utility be visually sorted per the branding guide's utility-card pattern. */
  accent: string
  value: string
  options: UtilitySelectOption[]
  onChange: (value: string) => void
}

/**
 * Shared "Setup Utilities" building block — a bordered utility card wrapping a
 * labeled dropdown. Reused today for Spin Timer + Color Theme; future game modules
 * needing a settings dropdown (round length, category count, etc.) should reuse this
 * instead of building a one-off select.
 */
export default function UtilitySelect({ label, accent, value, options, onChange }: UtilitySelectProps) {
  return (
    <div className="utility-card" style={{ borderColor: accent }}>
      <div className="utility-card-label">{label}</div>
      <select
        className="utility-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ color: accent }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
