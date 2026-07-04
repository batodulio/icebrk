// Shared domain types used by every game module (Roulette today, Would You Rather /
// Jeopardy / future games later). Keep this file game-agnostic — anything specific
// to a single game belongs in that game's own folder.

export interface Participant {
  id: string
  name: string
}

export interface Winner {
  id: string
  participantId: string
  name: string
  /** Chronological place: 1 = first winner drawn, 2 = second, etc. */
  place: number
}

export type ColorThemeId = 'colorful' | 'summer' | 'ocean' | 'night'

export interface ColorTheme {
  id: ColorThemeId
  label: string
  /** Playful emoji shown next to the label in pickers (e.g. '☀️ 🌴' for Summer). */
  emoji: string
  /** Cycled across wedges/segments/team colors — reuse for any game that needs a rotating palette. */
  colors: string[]
  /** Per-color text override, for palette colors that need dark text for contrast (e.g. Sunshine Yellow). */
  darkTextColors: string[]
}

/** Every game module in the library gets a stable id used as its route path (e.g. /roulette) + future persistence. */
export type GameModuleId = 'roulette' | 'would-you-rather' | 'jeopardy' | 'bingo' | 'two-truths-and-a-lie' | 'scavenger-hunt'

export interface GameTabDefinition {
  id: string
  label: string
}
