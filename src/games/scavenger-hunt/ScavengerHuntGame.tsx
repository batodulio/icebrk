import { useState } from 'react'
import GameShell from '../shared/GameShell'
import type { HowToPlayContent } from '../shared/HowToPlay'
import { useSessionState } from '../shared/sessionStore'
import { useCloudSync } from '../shared/useCloudSync'
import type { ColorThemeId, GameTabDefinition } from '../shared/types'
import SchCustomizeTab from './SchCustomizeTab'
import SchArenaTab from './SchArenaTab'
import { DEFAULT_HUNT_MINUTES, MAX_ITEMS, buildStarterItems, createItem, type HuntItem, type HuntMinutes } from './types'

interface ScavengerHuntRow {
  items: HuntItem[]
  hunt_minutes: HuntMinutes
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
    <>Build your hunt list in <b>Customize Game</b>, or play the starter list. Pick items people can find where you're playing.</>,
    <>Set the hunt timer and a color theme.</>,
    <>Play solo or in teams, and open <b>Play Arena</b> on the big screen.</>,
    <>Tap <b>Start the Hunt</b> and send everyone searching!</>,
    <>When someone brings an item back or shows a photo of it, tap it to check it off.</>,
    <>Find every item before time's up to win the big celebration! 🎉</>,
  ],
  cheer: 'Ready, set, hunt! Move fast, look everywhere, and bring it home! 🏃💨',
}

interface ScavengerHuntGameProps {
  onExit: () => void
}

/**
 * Scavenger Hunt — the projected screen is the shared hunt board. The room races
 * to bring items in; the host taps them found before the countdown runs out.
 */
export default function ScavengerHuntGame({ onExit }: ScavengerHuntGameProps) {
  const [activeTab, setActiveTab] = useState<string>('arena')
  // Session-persisted: survives navigating away and back, resets on page refresh.
  const [items, setItems] = useSessionState<HuntItem[]>('sch:items', buildStarterItems)
  const [foundIds, setFoundIds] = useSessionState<Set<string>>('sch:found', () => new Set())
  const [minutes, setMinutes] = useSessionState<HuntMinutes>('sch:minutes', () => DEFAULT_HUNT_MINUTES)
  const [themeId, setThemeId] = useSessionState<ColorThemeId>('sch:theme', () => 'colorful')

  // Signed-in hosts: load saved items/settings on open, autosave changes after.
  useCloudSync<ScavengerHuntRow>(
    'scavenger-hunt',
    { items, hunt_minutes: minutes, theme_id: themeId },
    (row) => {
      setItems(row.items)
      setMinutes(row.hunt_minutes)
      setThemeId(row.theme_id)
      setFoundIds(new Set())
    },
  )

  const addItem = (text: string) => {
    setItems((current) => (current.length >= MAX_ITEMS ? current : [...current, createItem(text)]))
  }

  const updateItem = (id: string, text: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    setFoundIds((current) => {
      if (!current.has(id)) return current
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  const restoreItems = () => {
    setItems(buildStarterItems())
    setFoundIds(new Set())
  }

  const clearItems = () => {
    setItems([])
    setFoundIds(new Set())
  }

  const toggleFound = (itemId: string) => {
    setFoundIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const resetHunt = () => {
    setFoundIds(new Set())
  }

  return (
    <GameShell
      emoji="🔍"
      title="Scavenger Hunt"
      tagline="Find it, snap it, win it"
      tabs={TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      onBack={onExit}
      howToPlay={HOW_TO_PLAY}
    >
      {activeTab === 'customize' && (
        <SchCustomizeTab
          items={items}
          onAdd={addItem}
          onUpdate={updateItem}
          onRemove={removeItem}
          onRestore={restoreItems}
          onClear={clearItems}
          minutes={minutes}
          onMinutesChange={setMinutes}
          themeId={themeId}
          onThemeChange={setThemeId}
        />
      )}
      {activeTab === 'arena' && (
        <SchArenaTab
          items={items}
          foundIds={foundIds}
          themeId={themeId}
          minutes={minutes}
          onToggleFound={toggleFound}
          onReset={resetHunt}
        />
      )}
    </GameShell>
  )
}
