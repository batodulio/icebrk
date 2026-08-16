import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { loadGameSettings, saveGameSettings, saveGameSettingsBeacon } from '../../lib/apiClient'

const SAVE_DEBOUNCE_MS = 900

/**
 * Keeps a signed-in host's game setup synced to their row in Azure SQL, through
 * the /api/settings endpoints in server.js. On mount it loads any existing row
 * once and hands it to `onLoad` before autosave is allowed to run, so a
 * returning host's saved setup is never clobbered by fresh session defaults.
 * After that, every change to `data` is autosaved, debounced. Signed-out hosts
 * no-op entirely, leaving pure session-local play exactly as it was.
 *
 * `gameId` is the module's route id — 'roulette', 'jeopardy', and so on — which
 * is also the id the API validates against its allowlist.
 */
export function useCloudSync<Row extends object>(
  gameId: string,
  data: Row,
  onLoad: (row: Row) => void,
) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    loadGameSettings<Row>(gameId)
      .then((row) => {
        if (cancelled) return
        if (row) onLoadRef.current(row)
        setLoadedFor(userId)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error(`[useCloudSync] failed to load ${gameId}:`, error)
        // Still mark as loaded: a failed read should leave the host able to play
        // and save, rather than silently disabling autosave for the session.
        setLoadedFor(userId)
      })

    return () => {
      cancelled = true
    }
  }, [gameId, userId])

  // Always-current snapshot of what should be saved, so a flush triggered from
  // outside the debounce effect (unmount) can't grab a stale closure.
  const dataRef = useRef(data)
  dataRef.current = data
  const userIdRef = useRef(userId)
  userIdRef.current = userId
  const gameIdRef = useRef(gameId)
  gameIdRef.current = gameId
  const pendingRef = useRef(false)

  const dataKey = JSON.stringify(data)
  useEffect(() => {
    if (!userId || loadedFor !== userId) return

    pendingRef.current = true
    const handle = setTimeout(() => {
      pendingRef.current = false
      saveGameSettings(gameId, dataRef.current).catch((error: unknown) => {
        console.error(`[useCloudSync] failed to save ${gameId}:`, error)
      })
    }, SAVE_DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [gameId, userId, loadedFor, dataKey])

  // Runs only on true unmount (empty deps), not on every debounce reset. A host
  // who types a name and immediately navigates away would otherwise lose that
  // edit entirely — clearTimeout in the effect above cancels the pending write
  // with nothing to replace it. Flush it here instead of dropping it.
  useEffect(() => {
    return () => {
      if (pendingRef.current && userIdRef.current) {
        saveGameSettingsBeacon(gameIdRef.current, dataRef.current)
      }
    }
  }, [])
}
