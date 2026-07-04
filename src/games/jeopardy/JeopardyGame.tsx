import { useState } from 'react'
import GameShell from '../shared/GameShell'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import JpdCustomizeTab from './JpdCustomizeTab'
import JpdArenaTab from './JpdArenaTab'
import {
  DEFAULT_TEAM_NAMES,
  MAX_TEAMS,
  buildStarterBoard,
  createBlankCategory,
  createBlankClue,
  createTeam,
  type JpdCategory,
  type JpdTeam,
} from './types'

// Two tabs per game module: set up in Customize Game, play in Play Arena (default).
const TABS: GameTabDefinition[] = [
  { id: 'customize', label: 'Customize Game' },
  { id: 'arena', label: 'Play Arena' },
]

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
  const [board, setBoard] = useState<JpdCategory[]>(buildStarterBoard)
  const [teams, setTeams] = useState<JpdTeam[]>(() => DEFAULT_TEAM_NAMES.map(createTeam))
  const [usedClueIds, setUsedClueIds] = useState<Set<string>>(new Set())
  const [themeId, setThemeId] = useState<ColorThemeId>('colorful')

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

  const restoreBoard = () => {
    setBoard(buildStarterBoard())
    setUsedClueIds(new Set())
  }

  // Board sizing: shrinking truncates from the end, growing appends blank editable
  // slots. Category count and questions-per-category are derived from the board
  // itself, so the settings dropdowns always reflect reality (e.g. after a restore).
  const rowCount = board[0]?.clues.length ?? 0

  const setCategoryCount = (count: number) => {
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
    >
      {activeTab === 'customize' && (
        <JpdCustomizeTab
          board={board}
          rowCount={rowCount}
          onCategoryCountChange={setCategoryCount}
          onRowCountChange={setRowCount}
          onCategoryName={setCategoryName}
          onClueText={setClueText}
          onRestoreBoard={restoreBoard}
          teams={teams}
          onAddTeam={addTeam}
          onTeamName={setTeamName}
          onRemoveTeam={removeTeam}
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
          onAward={awardPoints}
          onNoAnswer={markUsed}
          onRestart={restartGame}
        />
      )}
    </GameShell>
  )
}
