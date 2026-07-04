import type { Participant } from './types'

// Shared participant model — any game that needs a roster (Roulette today; team setup
// for future games) should reuse this cap, parser, and factory instead of reinventing it.
export const MAX_PARTICIPANTS = 50

export function createParticipant(name: string): Participant {
  return { id: crypto.randomUUID(), name }
}

/** One name per line, blank lines ignored, surrounding whitespace trimmed. */
export function parseNamesFromText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
