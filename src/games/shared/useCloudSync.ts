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
      .then(({ data: row }) => {
        if (cancelled) return
        if (row) onLoadRef.current(row as Row)
        setLoadedFor(userId)
      })

    return () => {
      cancelled = true
    }
  }, [table, userId])

  const dataKey = JSON.stringify(data)
  useEffect(() => {
    if (!supabase || !userId || loadedFor !== userId) return
    const client = supabase
    const handle = setTimeout(() => {
      client.from(table).upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, userId, loadedFor, dataKey])
}
