// The two calls a game module needs, against the Express API in server.js.
//
// Both are same-origin, so the IceBrk session cookie rides along and the
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

/** A failed picture upload; `status` says why (401 signed out, 409 at the cap, 413 too big). */
export class ImageUploadError extends Error {
  status: number

  constructor(status: number) {
    super(`Image upload failed with ${status}`)
    this.status = status
  }
}

/** Uploads one picture for a signed-in host. Resolves to the URL to store on the clue. */
export async function uploadImage(image: Blob): Promise<string> {
  let response: Response
  try {
    response = await fetch('/api/images', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': image.type },
      body: image,
    })
  } catch {
    throw new ImageUploadError(0)
  }
  if (!response.ok) throw new ImageUploadError(response.status)
  const body = (await response.json()) as { url: string }
  return body.url
}

/**
 * Removes a stored picture. Only server URLs are deleted; a guest's in-browser
 * data: URL has nothing to clean up. Failures are ignored: the worst case is an
 * orphaned row counting toward the host's cap.
 */
export function deleteImage(url: string): void {
  if (!url.startsWith('/api/images/')) return
  void fetch(url, { method: 'DELETE', credentials: 'same-origin' }).catch(() => {})
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
