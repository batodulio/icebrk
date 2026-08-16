import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { loginUrl } from '../lib/authClient'

/**
 * /login. Sign-in runs entirely through App Service Easy Auth, so this page is
 * a doorway rather than a form: the button hands off to the platform, which
 * handles the credentials and comes back with a session. Nothing sensitive
 * passes through the app.
 *
 * Hosts already signed in get bounced straight back to the library.
 */
export default function AuthPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [loading, user, navigate])

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

      <section className="auth-hero auth-hero-signin">
        <div className="deco-blob" style={{ width: 220, height: 220, background: 'var(--energy-orange)', opacity: 0.9, top: -90, right: -70 }} />
        <div className="deco-blob" style={{ width: 150, height: 150, background: 'var(--vitality-green)', opacity: 0.85, bottom: -60, left: -50 }} />
        <div className="deco-blob" style={{ width: 16, height: 16, background: 'var(--sunshine)', top: '22%', left: '8%' }} />

        <div className="wrap auth-grid">
          <div className="auth-copy">
            <p className="auth-eyebrow">Welcome back, host</p>
            <h1>Your games missed you.</h1>
            <p className="auth-sub">
              With a free account, IceBrk remembers your rosters, question decks, and boards,
              so next game night starts where you left off.
            </p>
          </div>

          <div className="auth-card">
            <h2 className="auth-card-title">Sign in to save your games</h2>
            <p className="auth-card-sub">
              One tap with your Microsoft account. IceBrk sees your name, and that's it.
            </p>

            <a className="btn btn-yellow auth-submit" href={loginUrl('/')}>
              🚀 Continue with Microsoft
            </a>

            <Link className="auth-guest-link" to="/">
              Keep playing as a guest →
            </Link>

            <p className="auth-fineprint">
              Free forever. Every game runs beautifully while signed out too — an account
              simply carries your setups to the next event.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
