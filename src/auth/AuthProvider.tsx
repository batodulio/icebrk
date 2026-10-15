import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authClient from '../lib/authClient'
import type { AuthUser } from '../lib/authClient'

interface AuthContextValue {
  /** Signed-in host, or null when browsing as a guest. */
  user: AuthUser | null
  /** True until the first session check resolves, avoiding a "Log in" flash for returning hosts. */
  loading: boolean
  /** Both reject with an AuthError whose message is ready to show. */
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

/**
 * App-wide auth state, backed by the /api/auth endpoints. The server keeps the
 * session in an HttpOnly cookie, so a signed-in host stays signed in across
 * refreshes and every /api call is authenticated automatically.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    authClient.fetchCurrentUser().then((current) => {
      if (cancelled) return
      setUser(current)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const signIn = async (username: string, password: string) => {
    setUser(await authClient.signIn(username, password))
  }

  const signUp = async (username: string, password: string) => {
    setUser(await authClient.signUp(username, password))
  }

  const signOut = async () => {
    try {
      await authClient.signOut()
    } catch (error: unknown) {
      console.error('[auth] sign-out request failed:', error)
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
