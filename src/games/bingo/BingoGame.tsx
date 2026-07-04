import { useCallback, useState } from 'react'
import GameShell from '../shared/GameShell'
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

// Two tabs per game module: set up in Customize Game, play in Play Arena (default).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

interface BingoGameProps {
  onExit: () => void
}

/**
 * Bingo — classic 75-ball caller. The app draws and tracks the numbers on the
 * projected screen; players mark the cards generated in Customize Game.
 */
export default function BingoGame({ onExit }: BingoGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  const [calledNumbers, setCalledNumbers] = useState<number[]>([])
  const [cardCount, setCardCount] = useState(DEFAULT_CARD_COUNT)
  const [cards, setCards] = useState<BingoCard[]>(() => generateCards(DEFAULT_CARD_COUNT))
  const [autoCallSeconds, setAutoCallSeconds] = useState<AutoCallSeconds>(DEFAULT_AUTO_CALL)
  const [themeId, setThemeId] = useState<ColorThemeId>('colorful')

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
