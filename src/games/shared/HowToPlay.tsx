import { useId, useRef, type ReactNode } from 'react'

export interface HowToPlayContent {
  /** One short instruction per step; rendered as a numbered list. */
  steps: ReactNode[]
  /** The hype line that closes the card. */
  cheer: ReactNode
}

interface HowToPlayProps extends HowToPlayContent {
  gameTitle: string
}

/**
 * The "i" button at the right of a game's header, and the how-to-play card it opens.
 * Built on the native <dialog>, which brings Escape-to-close, focus trapping,
 * and an inert page behind it without any extra code.
 */
export default function HowToPlay({ gameTitle, steps, cheer }: HowToPlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()

  return (
    <>
      <button
        type="button"
        className="how-to-play-btn"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`How to play ${gameTitle}`}
        title="How to play"
      >
        i
      </button>

      <dialog
        ref={dialogRef}
        className="how-to-play"
        aria-labelledby={titleId}
        // The card fills the dialog box, so a click that lands on the dialog
        // itself is a click on the backdrop around it.
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        {/* The card clips the corner blobs; the body inside it scrolls on short
            screens. Doing both on one element would let the blobs' overhang
            count as scrollable content. */}
        <div className="how-to-play-card">
          <span className="htp-blob htp-blob-1" aria-hidden="true" />
          <span className="htp-blob htp-blob-2" aria-hidden="true" />
          <button type="button" className="how-to-play-close" onClick={close} aria-label="Close">
            ×
          </button>

          <div className="how-to-play-body">
            <p className="how-to-play-eyebrow">How to play</p>
            <h2 id={titleId} className="how-to-play-title">
              {gameTitle}
            </h2>

            <ol className="how-to-play-steps">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <p className="how-to-play-cheer">{cheer}</p>

            <button type="button" className="btn btn-blue how-to-play-go" onClick={close}>
              Let's play! 🚀
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
