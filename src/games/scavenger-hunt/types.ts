// Scavenger Hunt-specific types. The projected screen is the shared hunt board:
// the host taps items as the room brings them in, racing an optional countdown.

export interface HuntItem {
  id: string
  text: string
}

/** 0 = no time limit; otherwise hunt duration in minutes. */
export type HuntMinutes = 0 | 2 | 5 | 10 | 15

export const HUNT_MINUTES_OPTIONS: HuntMinutes[] = [0, 2, 5, 10, 15]

export const DEFAULT_HUNT_MINUTES: HuntMinutes = 5

export const MAX_ITEMS = 30

export function createItem(text: string): HuntItem {
  return { id: crypto.randomUUID(), text }
}

/** Starter list — findable indoors at an office, classroom, or home. */
export const STARTER_ITEMS: string[] = [
  'Something yellow',
  'A handwritten note',
  'Something older than you',
  'A snack worth sharing',
  'Something that smells good',
  'A photo of an animal',
  'Something smaller than a coin',
  'A book (paper or e-book)',
  'Something borrowed',
  'A plant, real or fake',
  'Something that makes noise',
  'Your most-used object today',
]

export function buildStarterItems(): HuntItem[] {
  return STARTER_ITEMS.map(createItem)
}
