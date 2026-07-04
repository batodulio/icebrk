import { useState } from 'react'
import GameShell from '../shared/GameShell'
import { useSessionState } from '../shared/sessionStore'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import CustomizeQuestionsTab from './CustomizeQuestionsTab'
import WyrArenaTab from './WyrArenaTab'
import {
  DEFAULT_TIMER_SECONDS,
  MAX_QUESTIONS,
  STARTER_QUESTIONS,
  createQuestion,
  type WyrQuestion,
  type WyrSide,
  type WyrTimerSeconds,
} from './types'

// Two tabs per game module: set up in Customize Game, play in Play Arena (default).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

interface WouldYouRatherGameProps {
  onExit: () => void
}

function buildStarterDeck(): WyrQuestion[] {
  return STARTER_QUESTIONS.map(([a, b]) => createQuestion(a, b))
}

/**
 * Would You Rather — second playable game module. The host projects one dilemma at
 * a time; the room debates and the host taps the winning side. Reuses the shared
 * GameShell/theme/sound/confetti systems established by Roulette.
 */
export default function WouldYouRatherGame({ onExit }: WouldYouRatherGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  // Session-persisted: survives navigating away and back, resets on page refresh.
  const [questions, setQuestions] = useSessionState<WyrQuestion[]>('wyr:questions', buildStarterDeck)
  const [index, setIndex] = useSessionState('wyr:index', () => 0)
  const [picks, setPicks] = useSessionState<Record<string, WyrSide>>('wyr:picks', () => ({}))
  const [timerSeconds, setTimerSeconds] = useSessionState<WyrTimerSeconds>('wyr:timer', () => DEFAULT_TIMER_SECONDS)
  const [themeId, setThemeId] = useSessionState<ColorThemeId>('wyr:theme', () => 'colorful')

  // Deck edits can shrink the list while the arena is mid-deck — clamp instead of
  // storing a possibly-stale index.
  const safeIndex = questions.length > 0 ? Math.min(index, questions.length - 1) : 0
  const currentQuestion = questions.length > 0 ? questions[safeIndex] : null

  const tally = Object.values(picks).reduce(
    (acc, side) => {
      acc[side] += 1
      return acc
    },
    { a: 0, b: 0 },
  )

  const addQuestion = (a: string, b: string) => {
    setQuestions((current) => (current.length >= MAX_QUESTIONS ? current : [...current, createQuestion(a, b)]))
  }

  const updateQuestion = (id: string, side: WyrSide, text: string) => {
    setQuestions((current) => current.map((q) => (q.id === id ? { ...q, [side]: text } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions((current) => current.filter((q) => q.id !== id))
    setPicks((current) => {
      if (!(id in current)) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const shuffleDeck = () => {
    setQuestions((current) => {
      const next = [...current]
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      return next
    })
    setIndex(0)
  }

  const restoreStarterDeck = () => {
    setQuestions(buildStarterDeck())
    setPicks({})
    setIndex(0)
  }

  const handlePick = (questionId: string, side: WyrSide) => {
    setPicks((current) => ({ ...current, [questionId]: side }))
  }

  const restartDeck = () => {
    setPicks({})
    setIndex(0)
  }

  return (
    <GameShell
      emoji="🤔"
      title="Would You Rather"
      tagline="Pick a side, defend it"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
    >
      {activeTab === 'customize' && (
        <CustomizeQuestionsTab
          questions={questions}
          onAdd={addQuestion}
          onUpdate={updateQuestion}
          onRemove={removeQuestion}
          onShuffle={shuffleDeck}
          onRestore={restoreStarterDeck}
          timerSeconds={timerSeconds}
          onTimerSecondsChange={setTimerSeconds}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <WyrArenaTab
          question={currentQuestion}
          index={safeIndex}
          total={questions.length}
          pick={currentQuestion ? (picks[currentQuestion.id] ?? null) : null}
          tally={tally}
          themeId={themeId}
          timerSeconds={timerSeconds}
          onPick={handlePick}
          onPrev={() => setIndex(Math.max(safeIndex - 1, 0))}
          onNext={() => setIndex(Math.min(safeIndex + 1, questions.length - 1))}
          onRestart={restartDeck}
        />
      )}
    </GameShell>
  )
}
