import { useCallback, useState } from 'react'
import GameShell from '../shared/GameShell'
import type { HowToPlayContent } from '../shared/HowToPlay'
import { useSessionState } from '../shared/sessionStore'
import { useCloudSync } from '../shared/useCloudSync'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import { soundManager } from '../shared/sound'
import BingoCustomizeTab from './BingoCustomizeTab'
import BingoArenaTab from './BingoArenaTab'
import {
  DEFAULT_AUTO_CALL,
  DEFAULT_CARD_COUNT,
  TOTAL_NUMBERS,
  generateCards,
  type AutoCallSeconds,
  type BingoCard,
} from './types'

interface BingoRow {
  card_count: number
  cards: BingoCard[]
  auto_call_seconds: AutoCallSeconds
  theme_id: ColorThemeId
}

// Two tabs per game module: set up in Customize Game, play in Play Arena (default).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

// Opened from the "i" at the right of the game header.
const HOW_TO_PLAY: HowToPlayContent = {
  steps: [
    <>In <b>Customize Game</b>, choose how many cards you need. Tap <b>Shuffle Cards</b> for a fresh set.</>,
    <>Deal a card to every player: print the page, screenshot it, or copy one onto paper.</>,
    <>Open <b>Play Arena</b> and put the caller on the big screen.</>,
    <>Tap <b>Call First Number</b>, then <b>Call Next Number</b>. Set an auto-call pace for hands-free calling.</>,
    <>Players mark each called number on their card. The ★ in the middle is free!</>,
    <>Five in a row across, down, or diagonally? Shout "BINGO!"</>,
    <>Tap <b>📣 BINGO!</b> to celebrate, then check the card against the board.</>,
  ],
  cheer: 'Cards ready, ears open… first to shout BINGO takes the glory! 📣🎉',
}

interface BingoGameProps {
  onExit: () => void
}

/**
 * Bingo — classic 75-ball caller. The app draws and tracks the numbers on the
 * projected screen; players mark the cards generated in Customize Game.
 */
export default function BingoGame({ onExit }: BingoGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  // Session-persisted: survives navigating away and back, resets on page refresh.
  const [calledNumbers, setCalledNumbers] = useSessionState<number[]>('bng:called', () => [])
  const [cardCount, setCardCount] = useSessionState('bng:cardCount', () => DEFAULT_CARD_COUNT)
  const [cards, setCards] = useSessionState<BingoCard[]>('bng:cards', () => generateCards(DEFAULT_CARD_COUNT))
  const [autoCallSeconds, setAutoCallSeconds] = useSessionState<AutoCallSeconds>('bng:autoCall', () => DEFAULT_AUTO_CALL)
  const [themeId, setThemeId] = useSessionState<ColorThemeId>('bng:theme', () => 'colorful')

  // Signed-in hosts: load saved cards/settings on open, autosave changes after.
  useCloudSync<BingoRow>(
    'bingo',
    { card_count: cardCount, cards, auto_call_seconds: autoCallSeconds, theme_id: themeId },
    (row) => {
      setCardCount(row.card_count)
      setCards(row.cards)
      setAutoCallSeconds(row.auto_call_seconds)
      setThemeId(row.theme_id)
      setCalledNumbers([])
    },
  )

  const draw = useCallback(() => {
    setCalledNumbers((current) => {
      if (current.length >= TOTAL_NUMBERS) return current
      const calledSet = new Set(current)
      const remaining: number[] = []
      for (let n = 1; n <= TOTAL_NUMBERS; n++) {
        if (!calledSet.has(n)) remaining.push(n)
      }
      const next = remaining[Math.floor(Math.random() * remaining.length)]
      return [...current, next]
    })
    soundManager.playDrawPop()
  }, [])

  const resetGame = useCallback(() => {
    setCalledNumbers([])
  }, [])

  const handleCardCountChange = (count: number) => {
    setCardCount(count)
    setCards(generateCards(count))
  }

  return (
    <GameShell
      emoji="🎱"
      title="Bingo"
      tagline="Mark the board, shout it out"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
      howToPlay={HOW_TO_PLAY}
    >
      {activeTab === 'customize' && (
        <BingoCustomizeTab
          cards={cards}
          cardCount={cardCount}
          onCardCountChange={handleCardCountChange}
          onRegenerate={() => setCards(generateCards(cardCount))}
          autoCallSeconds={autoCallSeconds}
          onAutoCallChange={setAutoCallSeconds}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <BingoArenaTab
          calledNumbers={calledNumbers}
          themeId={themeId}
          autoCallSeconds={autoCallSeconds}
          onDraw={draw}
          onReset={resetGame}
        />
      )}
    </GameShell>
  )
}
