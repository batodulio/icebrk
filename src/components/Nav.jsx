import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.tsx'

export default function Nav() {
  const { user, loading, signOut } = useAuth()

  return (
    <div className="nav">
      <div className="nav-inner">
        <a className="brand" href="#top" aria-label="IceBrk home">
          <span className="brand-mark">IB</span>
          IceBrk
        </a>
        <div className="nav-links">
          <a href="#games">Games</a>
          <a href="#how">How it works</a>
          <a href="#quote">Why hosts love it</a>
        </div>
        <div className="nav-actions">
          <Link className="nav-coffee" to="/support">☕ Buy me a coffee</Link>
          {!loading &&
            (user ? (
              <>
                <span className="nav-user" title={user.user_metadata?.username}>
                  👋 {user.user_metadata?.username ?? 'friend'}
                </span>
                <button type="button" className="nav-coffee nav-logout" onClick={signOut}>
                  Log out
                </button>
              </>
            ) : (
              <Link className="btn btn-blue" to="/login">Log in</Link>
            ))}
        </div>
      </div>
    </div>
  )
}
