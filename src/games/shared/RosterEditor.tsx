import { useState } from 'react'
import type { UseParticipantsResult } from './useParticipants'

interface RosterEditorProps {
  roster: UseParticipantsResult
}

/**
 * Shared "who's playing" editor: paste-names card + editable participant grid.
 * Extracted from Roulette's Customize tab so every game with a roster (Roulette,
 * Two Truths & a Lie, future team games) shares one implementation.
 */
export default function RosterEditor({ roster }: RosterEditorProps) {
  const [pasteText, setPasteText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const commitPastedNames = () => {
    if (!pasteText.trim()) return
    const { added, overflow } = roster.addFromText(pasteText)
    setPasteText('')
    if (overflow > 0) {
      setNotice(`Added ${added} names — ${overflow} skipped, ${roster.max} max reached.`)
    } else if (added > 0) {
      setNotice(null)
    }
  }

  return (
    <>
      <div className="customize-card paste-card">
        <div className="customize-card-head">
          <h3>📝 Paste Names</h3>
          <span className="participant-count-badge">
            {roster.count} / {roster.max}
          </span>
        </div>
        <p className="customize-card-hint">One name per line — they'll turn into participant cards below.</p>
        <textarea
          className="paste-textarea"
          placeholder={'John\nSarah\nMichael\nAshley'}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          onPaste={() => {
            // Let the paste land in the textarea first, then convert it on the next tick.
            requestAnimationFrame(commitPastedNames)
          }}
          disabled={roster.isFull}
          rows={6}
        />
        {notice && <p className="customize-notice">{notice}</p>}
        <div className="customize-card-actions">
          <button type="button" className="btn btn-primary" onClick={commitPastedNames} disabled={roster.isFull || !pasteText.trim()}>
            Add to Participants
          </button>
          {roster.isFull && <span className="customize-notice">Maximum of {roster.max} participants reached.</span>}
        </div>
      </div>

      <div className="participant-grid">
        {roster.participants.map((p) => (
          <div className="participant-card" key={p.id}>
            <input
              className="participant-name-input"
              value={p.name}
              onChange={(e) => roster.updateName(p.id, e.target.value)}
              aria-label="Participant name"
            />
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
          <p className="participant-empty">Paste names above to build your participant list.</p>
        )}
      </div>
    </>
  )
}
