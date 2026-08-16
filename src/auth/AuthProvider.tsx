import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, logoutUrl, type AuthUser } from '../lib/authClient'

interface AuthContextValue {
  /** Signed-in host, or null when browsing as a guest. */
  user: AuthUser | null
  /** True until the first session check resolves, avoiding a "Log in" flash for returning hosts. */
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: false, signOut: () => {} })

/**
 * App-wide auth state, backed by App Service Easy Auth. The platform keeps the
 * session in its own cookie, so a signed-in host stays signed in across
 * refreshes and every /api call is authenticated automatically.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchCurrentUser().then((current) => {
      if (cancelled) return
      setUser(current)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Sign-out is a platform redirect rather than a local state change, so the
  // session cookie is actually cleared instead of just being forgotten by the UI.
  const signOut = () => {
    window.location.href = logoutUrl('/')
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
