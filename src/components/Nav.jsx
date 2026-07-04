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
          <a className="btn btn-yellow" href="#games">Start Free</a>
        </div>
      </div>
    </div>
  )
}
