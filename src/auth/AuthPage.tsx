import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { friendlyAuthError, normalizeUsername, USERNAME_HINT, USERNAME_PATTERN, usernameToEmail } from '../lib/username'

type AuthMode = 'signin' | 'signup'

/**
 * /login. One page for both sign in and create account, toggled in place. Keeps
 * the same playful tone as the rest of the site: blue hero, white tilted card.
 * On success, hosts land back on the library; saved game setups (Supabase
 * tables in supabase/schema.sql) key off the signed-in user.
 *
 * No email is ever collected, just a username and password. See src/lib/username.ts
 * for how that's translated into something Supabase Auth can work with.
 */
export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || busy) return

    if (!USERNAME_PATTERN.test(username)) {
      setError(`Usernames need ${USERNAME_HINT}.`)
      return
    }

    setBusy(true)
    setError(null)
    setNotice(null)
    const email = usernameToEmail(username)

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: normalizeUsername(username) } },
      })
      setBusy(false)
      if (signUpError) {
        setError(friendlyAuthError(signUpError.message))
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase's anti-enumeration behavior: no error, but an empty identities
        // array means this "email" (derived from the username) already exists.
        setError('That username is already taken. Try logging in instead.')
      } else if (data.session) {
        navigate('/')
      } else {
        // Only reachable if "Confirm email" is on in the Supabase dashboard, which
        // breaks username-only signup since the derived address can't receive mail.
        setError('Signup could not be completed. Ask your admin to turn off "Confirm email" for this project.')
      }
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (signInError) {
      setError(friendlyAuthError(signInError.message))
    } else {
      navigate('/')
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
              <label className="auth-label" htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                className="auth-input"
                type="text"
                autoComplete="username"
                placeholder="yourusername"
                pattern={USERNAME_PATTERN.source}
                minLength={3}
                maxLength={20}
                title={USERNAME_HINT}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label className="auth-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="auth-error" role="alert">{error}</p>}
              {notice && <p className="auth-notice" role="status">{notice}</p>}

              <button className="btn btn-yellow auth-submit" type="submit" disabled={busy}>
                {busy ? 'One sec…' : isSignup ? '🎉 Create my account' : '🚀 Log me in'}
              </button>
            </form>

            <p className="auth-fineprint">
              Free forever. Just a username and password, no email required.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
