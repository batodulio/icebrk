import { useCallback, useState } from 'react'
import type { Participant } from './types'
import { MAX_PARTICIPANTS, createParticipant, parseNamesFromText } from './participants'

export interface UseParticipantsResult {
  participants: Participant[]
  count: number
  max: number
  isFull: boolean
  /** Parses pasted/typed text into participant cards, capped at MAX_PARTICIPANTS. Returns how many were dropped for being over the cap. */
  addFromText: (text: string) => { added: number; overflow: number }
  addOne: (name: string) => boolean
  updateName: (id: string, name: string) => void
  remove: (id: string) => void
}

/** Shared participant roster state — reusable by any game module that needs a list of people (Roulette, future team-based games). */
export function useParticipants(): UseParticipantsResult {
  const [participants, setParticipants] = useState<Participant[]>([])

  const addFromText = useCallback((text: string) => {
    const names = parseNamesFromText(text)
    let added = 0
    let overflow = 0

    setParticipants((current) => {
      const room = MAX_PARTICIPANTS - current.length
      const toAdd = names.slice(0, Math.max(room, 0))
      added = toAdd.length
      overflow = names.length - toAdd.length
      if (toAdd.length === 0) return current
      return [...current, ...toAdd.map(createParticipant)]
    })

    return { added, overflow }
  }, [])

  const addOne = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false
    let didAdd = false
    setParticipants((current) => {
      if (current.length >= MAX_PARTICIPANTS) return current
      didAdd = true
      return [...current, createParticipant(trimmed)]
    })
    return didAdd
  }, [])

  const updateName = useCallback((id: string, name: string) => {
    setParticipants((current) => current.map((p) => (p.id === id ? { ...p, name } : p)))
  }, [])

  const remove = useCallback((id: string) => {
    setParticipants((current) => current.filter((p) => p.id !== id))
  }, [])

  return {
    participants,
    count: participants.length,
    max: MAX_PARTICIPANTS,
    isFull: participants.length >= MAX_PARTICIPANTS,
    addFromText,
    addOne,
    updateName,
    remove,
  }
}
