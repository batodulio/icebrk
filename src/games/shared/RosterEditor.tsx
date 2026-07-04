import type { UseParticipantsResult } from './useParticipants'

interface RosterEditorProps {
  roster: UseParticipantsResult
}

/**
 * Shared "who's playing" editor. The textarea is the roster: every keystroke and
 * paste syncs the participant list instantly — no add button. Chips below mirror
 * the list; removing a chip also deletes its line from the textarea.
 */
export default function RosterEditor({ roster }: RosterEditorProps) {
  return (
    <>
      <div className="customize-card paste-card">
        <div className="customize-card-head">
          <h3>📝 Type or Paste Names</h3>
          <span className="participant-count-badge">
            {roster.count} / {roster.max}
          </span>
        </div>
        <p className="customize-card-hint">One name per line — the game updates live as you type. No save button needed.</p>
        <textarea
          className="paste-textarea"
          placeholder={'John\nSarah\nMichael\nAshley'}
          value={roster.text}
          onChange={(e) => roster.setText(e.target.value)}
          rows={6}
        />
        {roster.overflow > 0 && (
          <p className="customize-notice">
            Maximum of {roster.max} participants — the last {roster.overflow} name{roster.overflow > 1 ? 's' : ''} won't join the game.
          </p>
        )}
      </div>

      <div className="participant-grid">
        {roster.participants.map((p) => (
          <div className="participant-card" key={p.id}>
            <span className="participant-name-label">{p.name}</span>
            <button
              type="button"
              className="participant-remove"
              onClick={() => roster.remove(p.id)}
              aria-label={`Remove ${p.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {roster.participants.length === 0 && (
          <p className="participant-empty">Type names above to build your participant list.</p>
        )}
      </div>
    </>
  )
}
