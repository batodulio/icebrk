import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

// In-memory session store: game state survives navigating between games and the
// library, but is deliberately NOT written to localStorage — a full page refresh
// starts everyone fresh. Plain module memory gives exactly that lifetime.
const store = new Map<string, unknown>()

function loadSession<T>(key: string, init: () => T): T {
  if (!store.has(key)) store.set(key, init())
  return store.get(key) as T
}

/**
 * Drop-in useState replacement whose value is keyed into the session store, so a
 * game module remounting (user left and came back) resumes where it was. Values
 * are held as live objects — Sets and Maps work without serialization.
 */
export function useSessionState<T>(key: string, init: () => T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => loadSession(key, init))

  useEffect(() => {
    store.set(key, value)
  }, [key, value])

  return [value, setValue]
}
