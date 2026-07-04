import { useCallback } from 'react'
import type { Participant } from './types'
import { MAX_PARTICIPANTS, parseNamesFromText } from './participants'
import { useSessionState } from './sessionStore'

export interface UseParticipantsResult {
  participants: Participant[]
  count: number
  max: number
  isFull: boolean
  /** Names beyond the cap currently typed in the textarea (shown but not added). */
  overflow: number
  /** Raw textarea content — the roster's source of truth, edited live. */
  text: string
  /** Live-syncs the roster to the textarea: participants update on every keystroke. */
  setText: (text: string) => void
  /** Removes one participant and deletes their line from the textarea. */
  remove: (id: string) => void
}

/**
 * Shared participant roster, session-persisted under `storageKey` (survives
 * navigating away and back; cleared by a page refresh). The roster mirrors the
 * paste/type textarea line by line — no explicit "add" step. Participant ids are
 * kept stable per line index so winner logs keep pointing at the same entry.
 */
export function useParticipants(storageKey: string): UseParticipantsResult {
  const [text, setTextState] = useSessionState<string>(`${storageKey}:text`, () => '')
  const [participants, setParticipants] = useSessionState<Participant[]>(`${storageKey}:list`, () => [])

  const syncFromText = useCallback(
    (nextText: string) => {
      setTextState(nextText)
      const names = parseNamesFromText(nextText).slice(0, MAX_PARTICIPANTS)
      setParticipants((prev) => names.map((name, i) => (prev[i] && prev[i].name === name ? prev[i] : { id: prev[i]?.id ?? crypto.randomUUID(), name })))
    },
    [setTextState, setParticipants],
  )

  const remove = useCallback(
    (id: string) => {
      const index = participants.findIndex((p) => p.id === id)
      if (index === -1) return

      setParticipants((prev) => prev.filter((p) => p.id !== id))
      // Delete the participant's line from the textarea too (the i-th non-blank line).
      // Kept as a separate top-level update: nesting it inside the other updater
      // would run the side effect twice under StrictMode's double-invoke.
      setTextState((currentText) => {
        const lines = currentText.split('\n')
        let seen = -1
        const kept = lines.filter((line) => {
          if (line.trim().length === 0) return true
          seen += 1
          return seen !== index
        })
        return kept.join('\n')
      })
    },
    [participants, setParticipants, setTextState],
  )

  const typedCount = parseNamesFromText(text).length

  return {
    participants,
    count: participants.length,
    max: MAX_PARTICIPANTS,
    isFull: participants.length >= MAX_PARTICIPANTS,
    overflow: Math.max(typedCount - MAX_PARTICIPANTS, 0),
    text,
    setText: syncFromText,
    remove,
  }
}
