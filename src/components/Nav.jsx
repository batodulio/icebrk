import { Link } from 'react-router-dom'

export default function Nav() {
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
        </div>
      </div>
    </div>
  )
}
