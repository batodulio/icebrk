import { useState } from 'react'
import GameShell from '../shared/GameShell'
import type { HowToPlayContent } from '../shared/HowToPlay'
import { deleteImage } from '../../lib/apiClient'
import { useSessionState } from '../shared/sessionStore'
import { useCloudSync } from '../shared/useCloudSync'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import JpdCustomizeTab from './JpdCustomizeTab'
import JpdArenaTab from './JpdArenaTab'
import {
  DEFAULT_JPD_TIMER,
  DEFAULT_TEAM_NAMES,
  MAX_TEAMS,
  buildStarterBoard,
  createBlankCategory,
  createBlankClue,
  createTeam,
  type JpdCategory,
  type JpdClue,
  type JpdTeam,
  type JpdTimerSeconds,
} from './types'

/**
 * Guests' pictures are data: URLs, far too large for the 64 KB settings row. If
 * a guest signs in mid-setup, their board saves without those pictures rather
 * than failing to save at all.
 */
function withoutLocalPictures(board: JpdCategory[]): JpdCategory[] {
  return board.map((cat) => ({
    ...cat,
    clues: cat.clues.map((clue) => (clue.image?.startsWith('data:') ? { ...clue, image: undefined } : clue)),
  }))
}

/** Deletes the stored pictures of clues that are about to leave the board. */
function releasePictures(clues: JpdClue[]): void {
  for (const clue of clues) if (clue.image) deleteImage(clue.image)
}

interface JeopardyRow {
  board: JpdCategory[]
  teams: JpdTeam[]
  // Optional because rows saved before the answer timer existed lack it.
  timer_seconds?: JpdTimerSeconds
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
    <>Set up your categories, questions, answers, teams, and <b>Answer Timer</b> in <b>Customize Game</b>.</>,
    <>Split the group into teams and open <b>Play Arena</b> on the big screen.</>,
    <>Round one: ask a quick trivia question. The team that nails it goes first.</>,
    <>Teams take turns picking a category and a point value. Tap that tile and read the question aloud.</>,
    <>The clock starts the moment the question appears. Answer before it flashes red! ⏱️</>,
    <>If the team misses, another team gets a chance to steal! Tap <b>↺</b> on the clock to give them fresh time.</>,
    <>Tap <b>Reveal Answer</b>, then tap the team that nailed it to give them the points.</>,
    <>Play every tile on the board. The team with the most points wins the crown! 👑</>,
  ],
  // Non-breaking spaces keep "A game!" and its emoji together when the line wraps.
  cheer: 'Teams ready? Lights up! Time to bring your A\u00a0game!\u00a0🔥🏆',
}

interface JeopardyGameProps {
  onExit: () => void
}

/**
 * Jeopardy — team trivia on a projected 4×4 board. The host opens a cell, reads
 * the question, reveals the answer, and awards the points; clearing the board
 * crowns the highest-scoring team.
 */
export default function JeopardyGame({ onExit }: JeopardyGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  // Session-persisted: survives navigating away and back, resets on page refresh.
  const [board, setBoard] = useSessionState<JpdCategory[]>('jpd:board', buildStarterBoard)
  const [teams, setTeams] = useSessionState<JpdTeam[]>('jpd:teams', () => DEFAULT_TEAM_NAMES.map(createTeam))
  const [usedClueIds, setUsedClueIds] = useSessionState<Set<string>>('jpd:used', () => new Set())
  const [themeId, setThemeId] = useSessionState<ColorThemeId>('jpd:theme', () => 'colorful')
  const [timerSeconds, setTimerSeconds] = useSessionState<JpdTimerSeconds>('jpd:timer', () => DEFAULT_JPD_TIMER)

  // Signed-in hosts: load a saved board/teams on open, autosave changes after.
  useCloudSync<JeopardyRow>(
    'jeopardy',
    { board: withoutLocalPictures(board), teams, timer_seconds: timerSeconds, theme_id: themeId },
    (row) => {
      setBoard(row.board)
      setTeams(row.teams)
      setTimerSeconds(row.timer_seconds ?? DEFAULT_JPD_TIMER)
      setThemeId(row.theme_id)
      setUsedClueIds(new Set())
    },
  )

  const setCategoryName = (categoryId: string, name: string) => {
    setBoard((current) => current.map((c) => (c.id === categoryId ? { ...c, name } : c)))
  }

  const setClueText = (categoryId: string, clueId: string, field: 'question' | 'answer', text: string) => {
    setBoard((current) =>
      current.map((c) =>
        c.id === categoryId
          ? { ...c, clues: c.clues.map((clue) => (clue.id === clueId ? { ...clue, [field]: text } : clue)) }
          : c,
      ),
    )
  }

  const setClueImage = (categoryId: string, clueId: string, image: string | undefined) => {
    setBoard((current) =>
      current.map((c) =>
        c.id === categoryId ? { ...c, clues: c.clues.map((clue) => (clue.id === clueId ? { ...clue, image } : clue)) } : c,
      ),
    )
  }

  const restoreBoard = () => {
    releasePictures(board.flatMap((cat) => cat.clues))
    setBoard(buildStarterBoard())
    setUsedClueIds(new Set())
  }

  // Blank every cell but keep the current board dimensions, so hosts can write
  // their own board from scratch without resizing first.
  const clearBoard = () => {
    releasePictures(board.flatMap((cat) => cat.clues))
    setBoard((current) => current.map((cat, i) => createBlankCategory(`Category ${i + 1}`, cat.clues.length)))
    setUsedClueIds(new Set())
  }

  // Board sizing: shrinking truncates from the end, growing appends blank editable
  // slots. Category count and questions-per-category are derived from the board
  // itself, so the settings dropdowns always reflect reality (e.g. after a restore).
  const rowCount = board[0]?.clues.length ?? 0

  const setCategoryCount = (count: number) => {
    releasePictures(board.slice(count).flatMap((cat) => cat.clues))
    setBoard((current) => {
      if (count === current.length) return current
      if (count < current.length) return current.slice(0, count)
      const rows = current[0]?.clues.length ?? 4
      const added = Array.from({ length: count - current.length }, (_, i) =>
        createBlankCategory(`Category ${current.length + i + 1}`, rows),
      )
      return [...current, ...added]
    })
  }

  const setRowCount = (count: number) => {
    releasePictures(board.flatMap((cat) => cat.clues.slice(count)))
    setBoard((current) =>
      current.map((cat) => {
        if (count === cat.clues.length) return cat
        if (count < cat.clues.length) return { ...cat, clues: cat.clues.slice(0, count) }
        const added = Array.from({ length: count - cat.clues.length }, (_, i) => createBlankClue(cat.clues.length + i))
        return { ...cat, clues: [...cat.clues, ...added] }
      }),
    )
  }

  const addTeam = () => {
    setTeams((current) => (current.length >= MAX_TEAMS ? current : [...current, createTeam(`Team ${current.length + 1}`)]))
  }

  const setTeamName = (teamId: string, name: string) => {
    setTeams((current) => current.map((t) => (t.id === teamId ? { ...t, name } : t)))
  }

  const removeTeam = (teamId: string) => {
    setTeams((current) => (current.length <= 1 ? current : current.filter((t) => t.id !== teamId)))
  }

  const markUsed = (clueId: string) => {
    setUsedClueIds((current) => new Set(current).add(clueId))
  }

  const awardPoints = (teamId: string, points: number, clueId: string) => {
    setTeams((current) => current.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t)))
    markUsed(clueId)
  }

  const restartGame = () => {
    setUsedClueIds(new Set())
    setTeams((current) => current.map((t) => ({ ...t, score: 0 })))
  }

  return (
    <GameShell
      emoji="🏆"
      title="Jeopardy"
      tagline="Trivia showdown, your categories"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
      howToPlay={HOW_TO_PLAY}
    >
      {activeTab === 'customize' && (
        <JpdCustomizeTab
          board={board}
          rowCount={rowCount}
          onCategoryCountChange={setCategoryCount}
          onRowCountChange={setRowCount}
          onCategoryName={setCategoryName}
          onClueText={setClueText}
          onClueImage={setClueImage}
          onRestoreBoard={restoreBoard}
          onClearBoard={clearBoard}
          teams={teams}
          onAddTeam={addTeam}
          onTeamName={setTeamName}
          onRemoveTeam={removeTeam}
          timerSeconds={timerSeconds}
          onTimerSecondsChange={setTimerSeconds}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <JpdArenaTab
          board={board}
          usedClueIds={usedClueIds}
          teams={teams}
          themeId={themeId}
          timerSeconds={timerSeconds}
          onAward={awardPoints}
          onNoAnswer={markUsed}
          onRestart={restartGame}
        />
      )}
    </GameShell>
  )
}
