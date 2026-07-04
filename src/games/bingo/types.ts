// Bingo-specific types. Classic 75-ball bingo: the app is the caller, players mark
// the generated cards (printed, screenshotted, or copied by hand).

export const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const

export const NUMBERS_PER_LETTER = 15

export const TOTAL_NUMBERS = BINGO_LETTERS.length * NUMBERS_PER_LETTER // 75

/** Column index (0=B … 4=O) for a called number. */
export function letterIndexFor(n: number): number {
  return Math.floor((n - 1) / NUMBERS_PER_LETTER)
}

export function callLabel(n: number): string {
  return `${BINGO_LETTERS[letterIndexFor(n)]}-${n}`
}

export type BingoCell = number | 'FREE'

export interface BingoCard {
  id: string
  /** 5 rows × 5 columns; column c draws from that letter's number range; center is FREE. */
  rows: BingoCell[][]
}

function sampleColumn(letterIndex: number, count: number): number[] {
  const low = letterIndex * NUMBERS_PER_LETTER + 1
  const pool = Array.from({ length: NUMBERS_PER_LETTER }, (_, i) => low + i)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

export function generateCard(): BingoCard {
  const columns = BINGO_LETTERS.map((_, c) => sampleColumn(c, 5))
  const rows: BingoCell[][] = Array.from({ length: 5 }, (_, r) =>
    BINGO_LETTERS.map((_, c) => (r === 2 && c === 2 ? ('FREE' as const) : columns[c][r])),
  )
  return { id: crypto.randomUUID(), rows }
}

export function generateCards(count: number): BingoCard[] {
  return Array.from({ length: count }, generateCard)
}

export const CARD_COUNT_OPTIONS = [2, 4, 6, 8, 10, 12]

export const DEFAULT_CARD_COUNT = 4

/** 0 = manual calling only; otherwise auto-call a new number every N seconds. */
export type AutoCallSeconds = 0 | 5 | 8 | 12

export const AUTO_CALL_OPTIONS: AutoCallSeconds[] = [0, 5, 8, 12]

export const DEFAULT_AUTO_CALL: AutoCallSeconds = 0
