// Identity, as served by the /api/auth endpoints in server.js.
//
// Hosts sign up with a username and password. The server checks them, then
// sets an HttpOnly session cookie that rides along with every same-origin
// request, so the client never stores a token and never sends a user id.

export interface AuthUser {
  /** Stable identifier for the signed-in host. */
  id: string
  /** Their username, shown in the nav bar. */
  name: string
}

// Mirrors the server's rules, so the form can say what's wrong before a round trip.
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
export const USERNAME_HINT = '3-20 characters: letters, numbers, and underscores'
export const PASSWORD_MIN = 8

/** A failed sign-in or sign-up, with copy that is ready to show the host. */
export class AuthError extends Error {}

const STATUS_MESSAGES: Record<number, string> = {
  400: `Usernames use ${USERNAME_HINT}, and passwords need ${PASSWORD_MIN}+ characters.`,
  401: 'Double-check your username and password, then give it another go.',
  409: 'That username is already spoken for. Pick another, or log in instead.',
  429: 'Lots of tries in a row! Take a breather and try again in a few minutes.',
}
const FALLBACK_MESSAGE = 'IceBrk sign-in is taking a quick break. Try again in a moment.'

/**
 * Reads the current session. Returns null for signed-out visitors, which is a
 * normal state rather than an error — guests play with session-local state.
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'same-origin',
      headers: { accept: 'application/json' },
    })
    // 204 signed out. Anything else unexpected is treated the same way.
    if (response.status !== 200) return null
    return (await response.json()) as AuthUser
  } catch {
    // Offline, or running `npm run dev` with no server behind it — treat it as
    // signed out so the app still works.
    return null
  }
}

async function submitCredentials(path: string, username: string, password: string): Promise<AuthUser> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new AuthError(FALLBACK_MESSAGE)
  }

  if (!response.ok) throw new AuthError(STATUS_MESSAGES[response.status] ?? FALLBACK_MESSAGE)
  return (await response.json()) as AuthUser
}

export function signIn(username: string, password: string): Promise<AuthUser> {
  return submitCredentials('/api/auth/login', username, password)
}

export function signUp(username: string, password: string): Promise<AuthUser> {
  return submitCredentials('/api/auth/signup', username, password)
}

/** Clears the session cookie on the server, where HttpOnly puts it out of the page's reach. */
export async function signOut(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
}
