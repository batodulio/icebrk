// Identity, as served by App Service Easy Auth.
//
// The platform owns the whole sign-in flow: /.auth/login/aad starts it,
// /.auth/logout ends it, and /.auth/me reports who is signed in. The browser
// never handles a password, and the app never stores a credential.

export interface AuthUser {
  /** Stable identifier for the signed-in host. */
  id: string
  /** Friendly name for the nav bar. */
  name: string
  /** Which provider signed them in, e.g. "aad". */
  provider: string
}

interface Claim {
  typ: string
  val: string
}

interface AppServicePrincipal {
  user_id?: string
  provider_name?: string
  user_claims?: Claim[]
}

interface StaticWebAppsPrincipal {
  userId?: string
  userDetails?: string
  identityProvider?: string
}

const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'

/** Prefer a human name from the token, falling back to the account identifier. */
function displayName(principal: AppServicePrincipal): string {
  const claims = principal.user_claims ?? []
  const claim = (type: string) => claims.find((c) => c.typ === type)?.val
  return claim('name') ?? claim(NAME_CLAIM) ?? claim('preferred_username') ?? principal.user_id ?? 'friend'
}

/**
 * Reads the current session. Returns null for signed-out visitors, which is a
 * normal state rather than an error — guests play with session-local state.
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch('/.auth/me', {
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return null

    const body: unknown = await response.json()

    // App Service returns an array of provider identities. Static Web Apps
    // returns { clientPrincipal }. Handling both keeps a future hosting change
    // from breaking sign-in.
    if (Array.isArray(body)) {
      const principal = body[0] as AppServicePrincipal | undefined
      if (!principal?.user_id) return null
      return {
        id: principal.user_id,
        name: displayName(principal),
        provider: principal.provider_name ?? 'aad',
      }
    }

    const principal = (body as { clientPrincipal?: StaticWebAppsPrincipal })?.clientPrincipal
    if (!principal?.userId) return null
    return {
      id: principal.userId,
      name: principal.userDetails ?? 'friend',
      provider: principal.identityProvider ?? 'aad',
    }
  } catch {
    // Offline, or running `npm run dev` without the platform in front — treat
    // it as signed out so the app still works.
    return null
  }
}

/** Where to send a host to sign in, returning them to `returnTo` afterwards. */
export function loginUrl(returnTo = '/'): string {
  return `/.auth/login/aad?post_login_redirect_url=${encodeURIComponent(returnTo)}`
}

export function logoutUrl(returnTo = '/'): string {
  return `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(returnTo)}`
}
