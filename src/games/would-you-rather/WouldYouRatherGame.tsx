import { useState } from 'react'
import GameShell from '../shared/GameShell'
import type { HowToPlayContent } from '../shared/HowToPlay'
import { useSessionState } from '../shared/sessionStore'
import { useCloudSync } from '../shared/useCloudSync'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import CustomizeQuestionsTab from './CustomizeQuestionsTab'
import WyrArenaTab from './WyrArenaTab'
import {
  DEFAULT_SIDE_LABELS,
  DEFAULT_TIMER_SECONDS,
  MAX_QUESTIONS,
  STARTER_QUESTIONS,
  createQuestion,
  type WyrQuestion,
  type WyrSide,
  type WyrSideLabels,
  type WyrTimerSeconds,
} from './types'

interface WyrRow {
  questions: WyrQuestion[]
  timer_seconds: WyrTimerSeconds
  // Optional because rows saved before side actions existed lack it.
  side_labels?: WyrSideLabels
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
    <>Write your dilemmas in <b>Customize Game</b>, or play the starter deck as is.</>,
    <>Set the side actions the room will do, like <b>Stand</b> / <b>Sit</b> or <b>Thumbs Up</b> / <b>Thumbs Down</b>.</>,
    <>Pick a color theme, and add a debate timer if you like.</>,
    <>Open <b>Play Arena</b> and read both sides out loud.</>,
    <>Everyone picks a side by doing its action, shown in the top-left corner of each card.</>,
    <>Let each side make its case. Tap <b>Start Timer</b> if you set one.</>,
    <>Tap the side that wins the room, then tap <b>Next Question →</b>.</>,
  ],
  cheer: 'Choose boldly, argue with flair, and may the best side win! 🎤🔥',
}

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
  const [sideLabels, setSideLabels] = useSessionState<WyrSideLabels>('wyr:sideLabels', () => DEFAULT_SIDE_LABELS)
  const [themeId, setThemeId] = useSessionState<ColorThemeId>('wyr:theme', () => 'colorful')

  // Signed-in hosts: load a saved deck/settings on open, autosave changes after.
  useCloudSync<WyrRow>(
    'would-you-rather',
    { questions, timer_seconds: timerSeconds, side_labels: sideLabels, theme_id: themeId },
    (row) => {
      setQuestions(row.questions)
      setTimerSeconds(row.timer_seconds)
      setSideLabels(row.side_labels ?? DEFAULT_SIDE_LABELS)
      setThemeId(row.theme_id)
      setIndex(0)
      setPicks({})
    },
  )

  // Deck edits can shrink the list while the arena is mid-deck — clamp instead of
  // storing a possibly-stale index.
  const safeIndex = questions.length > 0 ? Math.min(index, questions.length - 1) : 0
  const currentQuestion = questions.length > 0 ? questions[safeIndex] : null

  const addQuestion =(a: string, b: string) => {
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

  const clearDeck = () => {
    setQuestions([])
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
      howToPlay={HOW_TO_PLAY}
    >
      {activeTab === 'customize' && (
        <CustomizeQuestionsTab
          questions={questions}
          onAdd={addQuestion}
          onUpdate={updateQuestion}
          onRemove={removeQuestion}
          onShuffle={shuffleDeck}
          onRestore={restoreStarterDeck}
          onClear={clearDeck}
          timerSeconds={timerSeconds}
          onTimerSecondsChange={setTimerSeconds}
          sideLabels={sideLabels}
          onSideLabelsChange={setSideLabels}
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
          themeId={themeId}
          timerSeconds={timerSeconds}
          sideLabels={sideLabels}
          onPick={handlePick}
          onPrev={() => setIndex(Math.max(safeIndex - 1, 0))}
          onNext={() => setIndex(Math.min(safeIndex + 1, questions.length - 1))}
          onRestart={restartDeck}
        />
      )}
    </GameShell>
  )
}
