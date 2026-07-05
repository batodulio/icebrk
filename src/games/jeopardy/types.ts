// Jeopardy-specific types. The board is a grid of categories × point rows — both
// dimensions are host-configurable (3–6 categories, 3–5 questions each) and all
// text is editable. Point values are derived from the row: row n is worth n×200.

export interface JpdClue {
  id: string
  points: number
  question: string
  answer: string
}

export interface JpdCategory {
  id: string
  name: string
  clues: JpdClue[]
}

export interface JpdTeam {
  id: string
  name: string
  score: number
}

export function pointsForRow(rowIndex: number): number {
  return (rowIndex + 1) * 200
}

export const CATEGORY_COUNT_OPTIONS = [3, 4, 5, 6]

export const ROW_COUNT_OPTIONS = [3, 4, 5]

export const MAX_TEAMS = 6

export function createBlankClue(rowIndex: number): JpdClue {
  return { id: crypto.randomUUID(), points: pointsForRow(rowIndex), question: '', answer: '' }
}

export function createBlankCategory(name: string, rowCount: number): JpdCategory {
  return {
    id: crypto.randomUUID(),
    name,
    clues: Array.from({ length: rowCount }, (_, i) => createBlankClue(i)),
  }
}

export function createTeam(name: string): JpdTeam {
  return { id: crypto.randomUUID(), name, score: 0 }
}

export const DEFAULT_TEAM_NAMES = ['Team Adobo', 'Team Sinigang']

/**
 * Starter board — the same categories teased on the landing page's hero mockup
 * (Movies, Office Life, Random, Pinoy Pop). Hosts edit any text in Customize Game.
 */
const STARTER_BOARD: Array<{ name: string; clues: Array<[question: string, answer: string]> }> = [
  {
    name: 'Movies',
    clues: [
      ['This blue-alien planet epic is the highest-grossing film of all time', 'Avatar'],
      ['"I\'ll be back" is the famous line from this 1984 sci-fi classic', 'The Terminator'],
      ['This Pixar film takes place inside the mind of a girl named Riley', 'Inside Out'],
      ['He directed both Titanic and Avatar', 'James Cameron'],
    ],
  },
  {
    name: 'Office Life',
    clues: [
      ['"This meeting could have been" one of these instead', 'An email'],
      ['Three-letter acronym for working away from the office', 'WFH'],
      ['"You\'re on ___", the most-said phrase in video calls', 'Mute'],
      ['The Office (US) is set at this Scranton paper company', 'Dunder Mifflin'],
    ],
  },
  {
    name: 'Random',
    clues: [
      ['The largest planet in our solar system', 'Jupiter'],
      ['The number of colors in a rainbow', 'Seven'],
      ['The only mammal that can truly fly', 'The bat'],
      ['H2O is the chemical formula for this', 'Water'],
    ],
  },
  {
    name: 'Pinoy Pop',
    clues: [
      ['This icy Filipino dessert mixes shaved ice, milk, and sweet toppings', 'Halo-halo'],
      ['The Philippine jeepney was originally rebuilt from these WWII vehicles', 'US military jeeps'],
      ['The "Nation\'s Girl Group" behind the hit "Pantropiko"', 'BINI'],
      ['National hero who wrote Noli Me Tangere', 'José Rizal'],
    ],
  },
]

export function buildStarterBoard(): JpdCategory[] {
  return STARTER_BOARD.map((cat) => ({
    id: crypto.randomUUID(),
    name: cat.name,
    clues: cat.clues.map(([question, answer], i) => ({
      id: crypto.randomUUID(),
      points: pointsForRow(i),
      question,
      answer,
    })),
  }))
}
