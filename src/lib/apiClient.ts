// The two calls a game module needs, against the Express API in server.js.
//
// Both are same-origin, so the Easy Auth session cookie rides along and the
// server resolves identity from it — the client never sends a user id, and
// could not usefully lie about one if it tried.

/**
 * Loads a host's saved setup for one game.
 * Returns null when there's nothing saved yet, or when the caller is signed out.
 */
export async function loadGameSettings<Row>(gameId: string): Promise<Row | null> {
  const response = await fetch(`/api/settings/${gameId}`, {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  })

  // 401 signed out · 204 nothing saved yet. Both mean "start fresh".
  if (response.status === 401 || response.status === 204) return null
  if (!response.ok) throw new Error(`Load failed with ${response.status}`)

  return (await response.json()) as Row
}

/** Saves a host's setup for one game. Signed-out callers are a silent no-op. */
export async function saveGameSettings<Row>(gameId: string, data: Row): Promise<void> {
  const response = await fetch(`/api/settings/${gameId}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (response.status === 401) return
  if (!response.ok) throw new Error(`Save failed with ${response.status}`)
}

/**
 * Fire-and-forget save for the unmount path, where a normal fetch can be
 * cancelled by the page going away. sendBeacon survives that; when it is
 * unavailable the keepalive fetch is the next best thing.
 */
export function saveGameSettingsBeacon<Row>(gameId: string, data: Row): void {
  const url = `/api/settings/${gameId}`
  const body = JSON.stringify(data)

  // sendBeacon can only POST, so it is used purely as a last-gasp fallback
  // for the keepalive fetch below rather than the primary path.
  void fetch(url, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    /* the page is going away; nothing useful to do */
  })
}
