import { useMemo, useRef } from 'react'
import { COLOR_THEMES } from './themes'
import type { ColorThemeId } from './types'

interface ConfettiPieceSpec {
  angle: number
  distance: number
  size: number
  delay: number
  rotation: number
  color: string
  shape: 'dot' | 'tri' | 'rect'
}

interface ConfettiBurstProps {
  theme?: ColorThemeId
  pieceCount?: number
  onDone?: () => void
}

/**
 * Big, on-brand confetti burst. Mount this with a changing `key` prop (e.g.
 * `key={winCount}`) to replay it — it's a fire-once effect, not a persistent loop.
 * Reusable by any game module that wants a celebratory moment (round win, correct
 * answer, game complete) without hand-rolling its own particle animation.
 */
export default function ConfettiBurst({ theme = 'colorful', pieceCount = 48, onDone }: ConfettiBurstProps) {
  const palette = COLOR_THEMES[theme].colors
  const endedCountRef = useRef(0)

  const pieces = useMemo<ConfettiPieceSpec[]>(() => {
    return Array.from({ length: pieceCount }, (_, i) => {
      const angle = (360 / pieceCount) * i + (Math.random() * 24 - 12)
      return {
        angle,
        distance: 90 + Math.random() * 190,
        size: 8 + Math.random() * 10,
        delay: Math.random() * 200,
        rotation: Math.random() * 720 - 360,
        color: palette[i % palette.length],
        shape: i % 5 === 0 ? 'tri' : i % 3 === 0 ? 'rect' : 'dot',
      }
    })
  }, [pieceCount, palette])

  // animationend bubbles from each piece; only report done once every piece has landed.
  const handleAnimationEnd = () => {
    endedCountRef.current += 1
    if (endedCountRef.current >= pieceCount) onDone?.()
  }

  return (
    <div className="confetti-burst" aria-hidden="true" onAnimationEnd={handleAnimationEnd}>
      {pieces.map((p, i) => {
        const radians = (p.angle * Math.PI) / 180
        const dx = Math.cos(radians) * p.distance
        const dy = Math.sin(radians) * p.distance
        return (
          <span
            key={i}
            className={`confetti-piece ${p.shape === 'tri' ? 'confetti-piece-tri' : ''} ${p.shape === 'rect' ? 'confetti-piece-rect' : ''}`}
            style={{
              // @ts-expect-error custom properties consumed by CSS keyframes
              '--dx': `${dx}px`,
              '--dy': `${dy}px`,
              '--rot': `${p.rotation}deg`,
              width: p.shape === 'dot' ? p.size : p.shape === 'rect' ? p.size * 0.45 : undefined,
              height: p.shape === 'dot' ? p.size : p.shape === 'rect' ? p.size * 1.4 : undefined,
              background: p.shape !== 'tri' ? p.color : undefined,
              borderBottomColor: p.shape === 'tri' ? p.color : undefined,
              animationDelay: `${p.delay}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
