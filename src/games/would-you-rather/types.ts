// Would You Rather-specific types. The question deck and discussion-timer options
// are unique to this game — shared building blocks (UtilitySelect, themes, sound,
// confetti) come from src/games/shared.

export interface WyrQuestion {
  id: string
  /** Left side of the face-off. */
  a: string
  /** Right side of the face-off. */
  b: string
}

export type WyrSide = 'a' | 'b'

/** 0 = no timer; otherwise seconds of discussion time per question. */
export type WyrTimerSeconds = 0 | 30 | 60 | 90

export const WYR_TIMER_OPTIONS: WyrTimerSeconds[] = [0, 30, 60, 90]

export const DEFAULT_TIMER_SECONDS: WyrTimerSeconds = 0

export const MAX_QUESTIONS = 100

export function createQuestion(a: string, b: string): WyrQuestion {
  return { id: crypto.randomUUID(), a, b }
}

/**
 * Starter deck — workplace/classroom-safe with a Filipino flavor to match the
 * brand's voice. Hosts can edit or remove any of these in Customize Game.
 */
export const STARTER_QUESTIONS: Array<[string, string]> = [
  ['Adobo every day', 'Sinigang every day'],
  ['Videoke night', 'Board game night'],
  ['Beach trip', 'Mountain hike'],
  ['Always 10 minutes late', 'Always 30 minutes early'],
  ['Free lunch forever', 'Free coffee forever'],
  ['Sing a solo at the office party', 'Join the dance number'],
  ['Time travel to the past', 'Time travel to the future'],
  ['Talk to animals', 'Speak every language'],
  ['Be invisible', 'Be able to fly'],
  ['No traffic ever again', 'No long lines ever again'],
  ['Mango shake for life', 'Halo-halo for life'],
  ['Team lunch out', 'Early dismissal Friday'],
  ['Only group chats', 'Only email'],
  ['Pause time for 10 minutes a day', 'Rewind 10 seconds anytime'],
  ['Live without music', 'Live without movies'],
  ['Big birthday party', 'Quiet birthday trip'],
  ['Know every secret', 'Never be lied to'],
  ['Work from the beach', 'Work from a mountain cabin'],
  ['Rainy day with books', 'Sunny day outside'],
  ['Unli rice forever', 'Unli dessert forever'],
]
