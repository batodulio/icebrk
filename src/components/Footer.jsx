export default function Footer() {
  return (
    <footer>
      <div className="deco-blob" style={{ width: 160, height: 160, background: 'var(--sky-blue)', opacity: 0.9, top: -80, left: -50 }} />
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-logo">IceBrk</div>
          <div className="footer-links">
            <a href="#how">How it works</a>
            <a href="#games">Games</a>
            <a href="mailto:icebrkmnl@outlook.com">Contact</a>
          </div>
        </div>
        <div className="footer-bottom wrap">© 2026 IceBrk. Bonding made simple.</div>
      </div>
    </footer>
  )
}
