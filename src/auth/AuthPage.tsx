import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { AuthError, PASSWORD_MIN, USERNAME_HINT, USERNAME_PATTERN } from '../lib/authClient'

type AuthMode = 'signin' | 'signup'

/**
 * /login. One page for both sign in and create account, toggled in place: blue
 * hero for logging in, violet for signing up, same white tilted card. A host
 * picks a username and password, and that pair is all they need next time.
 *
 * Hosts already signed in get bounced straight back to the library.
 */
export default function AuthPage() {
  const navigate = useNavigate()
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [loading, user, navigate])

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return

    if (!USERNAME_PATTERN.test(username.trim())) {
      setError(`Usernames use ${USERNAME_HINT}.`)
      return
    }
    if (isSignup && password.length < PASSWORD_MIN) {
      setError(`Passwords need at least ${PASSWORD_MIN} characters.`)
      return
    }

    setBusy(true)
    setError(null)
    try {
      await (isSignup ? signUp : signIn)(username.trim(), password)
      // The effect above sends the now signed-in host back to the library.
    } catch (caught: unknown) {
      setError(caught instanceof AuthError ? caught.message : 'Something went sideways. Try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="nav">
        <div className="nav-inner">
          <Link className="brand" to="/" aria-label="IceBrk home">
            <span className="brand-mark">IB</span>
            IceBrk
          </Link>
          <div className="nav-actions">
            <Link className="nav-coffee" to="/">← Back to the games</Link>
          </div>
        </div>
      </div>

      <section className={`auth-hero${isSignup ? ' auth-hero-signup' : ' auth-hero-signin'}`}>
        <div className="deco-blob" style={{ width: 220, height: 220, background: 'var(--energy-orange)', opacity: 0.9, top: -90, right: -70 }} />
        <div className="deco-blob" style={{ width: 150, height: 150, background: 'var(--vitality-green)', opacity: 0.85, bottom: -60, left: -50 }} />
        <div className="deco-blob" style={{ width: 16, height: 16, background: 'var(--sunshine)', top: '22%', left: '8%' }} />

        <div className="wrap auth-grid">
          <div className="auth-copy">
            <p className="auth-eyebrow">{isSignup ? 'Join the fun' : 'Welcome back, host'}</p>
            <h1>{isSignup ? 'Set up once, host forever.' : 'Your games missed you.'}</h1>
            <p className="auth-sub">
              With a free account, IceBrk remembers your rosters, question decks, and boards,
              so next game night starts where you left off.
            </p>
          </div>

          <div className="auth-card">
            <div className="auth-toggle" role="tablist" aria-label="Log in or create account">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignup}
                className={`auth-toggle-btn${!isSignup ? ' is-active' : ''}`}
                onClick={() => switchMode('signin')}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignup}
                className={`auth-toggle-btn${isSignup ? ' is-active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Create account
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-label" htmlFor="auth-username">
                {isSignup ? 'Pick a username' : 'Username'}
              </label>
              <input
                id="auth-username"
                className="auth-input"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="yourusername"
                maxLength={20}
                title={USERNAME_HINT}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label className="auth-label" htmlFor="auth-password">
                {isSignup ? 'Pick a password' : 'Password'}
              </label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? `At least ${PASSWORD_MIN} characters` : 'Your password'}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="auth-error" role="alert">{error}</p>}

              <button className="btn btn-yellow auth-submit" type="submit" disabled={busy}>
                {busy ? 'One sec…' : isSignup ? '🎉 Create my account' : '🚀 Log me in'}
              </button>
            </form>

            <Link className="auth-guest-link" to="/">
              Keep playing as a guest →
            </Link>

            <p className="auth-fineprint">
              Free forever. A username and password is all it takes.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
