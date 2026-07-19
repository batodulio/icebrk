import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { supabase } from '../../lib/supabaseClient'

const SAVE_DEBOUNCE_MS = 900

/**
 * Keeps a signed-in host's game setup synced to their row in a Supabase
 * `*_settings` table (see supabase/schema.sql). On mount it loads any existing
 * row once and hands it to `onLoad` before autosave is allowed to run, so a
 * returning host's saved setup is never clobbered by fresh session defaults.
 * After that, every change to `data` is autosaved, debounced. Signed-out hosts
 * and unconfigured Supabase both no-op entirely, leaving pure session-local
 * play exactly as it was.
 */
export function useCloudSync<Row extends object>(
  table: string,
  data: Row,
  onLoad: (row: Row) => void,
) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const onLoadRef = useRef(onLoad)
  onLoadRef.current = onLoad
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase || !userId) return
    let cancelled = false

    supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (cancelled) return
        if (error) {
          console.error(`[useCloudSync] failed to load ${table}:`, error.message)
        } else if (row) {
          onLoadRef.current(row as Row)
        }
        setLoadedFor(userId)
      })

    return () => {
      cancelled = true
    }
  }, [table, userId])

  // Always-current snapshot of what should be saved, so a flush triggered from
  // outside the debounce effect (unmount) can't grab a stale closure.
  const dataRef = useRef(data)
  dataRef.current = data
  const userIdRef = useRef(userId)
  userIdRef.current = userId
  const pendingRef = useRef(false)

  const save = (uid: string) => {
    if (!supabase) return
    pendingRef.current = false
    supabase
      .from(table)
      .upsert({ user_id: uid, ...dataRef.current }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) console.error(`[useCloudSync] failed to save ${table}:`, error.message)
      })
  }

  const dataKey = JSON.stringify(data)
  useEffect(() => {
    if (!supabase || !userId || loadedFor !== userId) return
    pendingRef.current = true
    const handle = setTimeout(() => save(userId), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, loadedFor, dataKey])

  // Runs only on true unmount (empty deps), not on every debounce reset. A host
  // who types a name and immediately navigates away would otherwise lose that
  // edit entirely — clearTimeout in the effect above cancels the pending write
  // with nothing to replace it. Flush it here instead of dropping it.
  useEffect(() => {
    return () => {
      const uid = userIdRef.current
      if (pendingRef.current && uid) save(uid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
