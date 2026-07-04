import type { GameModuleId } from './types'

export interface GameCatalogEntry {
  id: GameModuleId
  emoji: string
  title: string
  tagline: string
  status: 'available' | 'coming-soon'
}

/**
 * Single source of truth for the game library's headline slots and the in-app
 * navigation target they map to. GameLibrary (marketing card) and App (routing to
 * the actual module or a Coming Soon placeholder) both read from this so the name,
 * emoji, and tagline never drift out of sync between the two.
 */
export const GAME_CATALOG: GameCatalogEntry[] = [
  { id: 'roulette', emoji: '🎯', title: 'Roulette', tagline: 'Spin the wheel, crown a winner', status: 'available' },
  { id: 'would-you-rather', emoji: '🤔', title: 'Would You Rather', tagline: 'Pick a side, defend it', status: 'available' },
  { id: 'jeopardy', emoji: '🏆', title: 'Jeopardy', tagline: 'Trivia showdown, your categories', status: 'available' },
  { id: 'bingo', emoji: '🎱', title: 'Bingo', tagline: 'Mark the board, shout it out', status: 'available' },
  { id: 'two-truths-and-a-lie', emoji: '🤥', title: 'Two Truths & a Lie', tagline: "Guess what's real", status: 'available' },
  { id: 'scavenger-hunt', emoji: '🔍', title: 'Scavenger Hunt', tagline: 'Find it, snap it, win it', status: 'available' },
]
