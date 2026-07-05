import { Link } from 'react-router-dom'
import gcashQr from '../assets/gcash-qr.png'

/**
 * /support — the "buy me a coffee" page. IceBrk isn't a paid product; this page
 * invites (never pressures) a donation via PayPal or GCash. Everything fits one
 * viewport on desktop: copy + PayPal + maker strip left, GCash QR right.
 */
export default function SupportPage() {
  return (
    <div className="support-screen">
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

      <section className="support-hero">
        <div className="deco-blob" style={{ width: 220, height: 220, background: 'var(--energy-orange)', opacity: 0.9, top: -90, right: -70 }} />
        <div className="deco-blob" style={{ width: 150, height: 150, background: 'var(--vitality-green)', opacity: 0.85, bottom: -60, left: -50 }} />
        <div className="deco-blob" style={{ width: 16, height: 16, background: 'var(--sunshine)', top: '22%', left: '8%' }} />
        <div className="wrap support-grid">
          <div className="support-copy">
            <p className="support-eyebrow">A note from the maker</p>
            <h1>This one&rsquo;s free. It always will be.</h1>
            <p className="support-sub">
              IceBrk is a passion project, one of many built to bring people together.
              If it made your group laugh, a coffee funds more free games and the next
              purposeful app. Any amount, zero obligation, always appreciated.
            </p>
            <a
              className="btn btn-yellow"
              href="https://paypal.me/batmanodulio"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ Buy Me a Coffee via PayPal
            </a>

            <div className="maker-strip">
              <span className="maker-avatar" aria-hidden="true">👋</span>
              <div className="maker-id">
                <p className="maker-name">Batman Odulio</p>
                <p className="maker-tag">Builder of purposeful passion projects from the Philippines</p>
              </div>
              <a
                className="maker-link"
                href="https://www.linkedin.com/in/batmanodulio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="maker-link-badge" aria-hidden="true">in</span>
                LinkedIn
              </a>
            </div>
          </div>

          <div className="gcash-card">
            <p className="gcash-or">or scan with GCash</p>
            <img src={gcashQr} alt="GCash QR code for icebrk. Scan with the GCash app to send a donation." />
            <p className="gcash-label">GCash · icebrk</p>
            <p className="gcash-sub">Open GCash → QR → Scan</p>
          </div>
        </div>
      </section>
    </div>
  )
}
