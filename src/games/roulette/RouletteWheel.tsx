import { useRef, useState } from 'react'
import type { Participant } from '../shared/types'
import { COLOR_THEMES, wedgeTextColor } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { soundManager } from '../shared/sound'
import ConfettiBurst from '../shared/ConfettiBurst'
import type { SpinSeconds } from './types'

interface RouletteWheelProps {
  participants: Participant[]
  spinSeconds: SpinSeconds
  themeId: ColorThemeId
  spinning: boolean
  /** Overrides the default "add participants" hint when the wheel can't spin (e.g. everyone already won). */
  emptyHint?: string
  onSpinStart: () => void
  onSpinComplete: (winner: Participant) => void
}

const SIZE = 220
const CENTER = SIZE / 2
// Carnival-style rim: a bold ring with alternating "lights" that spin with the wheel.
const RIM_WIDTH = 12
const RIM_RADIUS = SIZE / 2 - RIM_WIDTH / 2 - 1
const RADIUS = RIM_RADIUS - RIM_WIDTH / 2 + 1
const LABEL_RADIUS = RADIUS * 0.62
const LIGHT_COUNT = 16
// SVG polar coordinates put 0° at 3 o'clock, but the pointer sits at 12 o'clock.
// All wedge geometry is drawn shifted by -90° so wedge angle 0 starts at the top —
// this keeps the rotation math (which targets the top pointer) and the visuals in
// sync, guaranteeing the wedge under the pointer is the announced winner.
const ANGLE_OFFSET = -90
// Number of full extra rotations layered on top of the precise winning angle, purely
// for visual drama — doesn't affect which participant wins.
const EXTRA_SPINS = 6

function polarPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function wedgePath(startAngle: number, endAngle: number): string {
  const start = polarPoint(startAngle, RADIUS)
  const end = polarPoint(endAngle, RADIUS)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

function truncateName(name: string): string {
  return name.length > 12 ? `${name.slice(0, 11)}…` : name
}

/**
 * Center column of the Play Arena — the spinning wheel itself. Owns its own
 * rotation/animation state; delegates sound to the shared soundManager and the win
 * celebration to the shared ConfettiBurst so those systems stay reusable elsewhere.
 */
export default function RouletteWheel({ participants, spinSeconds, themeId, spinning, emptyHint, onSpinStart, onSpinComplete }: RouletteWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [transitionMs, setTransitionMs] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [burstKey, setBurstKey] = useState(0)
  const [lastWinnerName, setLastWinnerName] = useState<string | null>(null)
  const pendingWinnerRef = useRef<Participant | null>(null)

  const theme = COLOR_THEMES[themeId]
  const n = participants.length
  const wedgeAngle = n > 0 ? 360 / n : 0
  const showLabels = n > 0 && n <= 24

  const canSpin = n >= 2 && !spinning

  const handleSpin = () => {
    if (!canSpin) return

    const winnerIndex = Math.floor(Math.random() * n)
    const winner = participants[winnerIndex]
    pendingWinnerRef.current = winner

    // Wedge i spans [i*wedgeAngle, (i+1)*wedgeAngle) with angle 0 = top (see
    // ANGLE_OFFSET), increasing clockwise. Bring its center to the top pointer by
    // rotating so (center + rotation) % 360 === 0.
    const wedgeCenter = winnerIndex * wedgeAngle + wedgeAngle / 2
    const targetMod = ((360 - wedgeCenter) % 360 + 360) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = ((targetMod - currentMod) % 360 + 360) % 360
    const nextRotation = rotation + EXTRA_SPINS * 360 + delta

    const durationMs = spinSeconds * 1000
    setTransitionMs(durationMs)
    setCelebrating(false)
    setRotation(nextRotation)
    onSpinStart()
    soundManager.playSpinTicks(durationMs)
  }

  const handleTransitionEnd = () => {
    const winner = pendingWinnerRef.current
    if (!winner) return
    pendingWinnerRef.current = null

    soundManager.playWinnerFanfare()
    setLastWinnerName(winner.name)
    setCelebrating(true)
    setBurstKey((k) => k + 1)
    onSpinComplete(winner)
  }

  return (
    <div className="wheel-panel">
      <div className="wheel-stage">
        <div className="wheel-pointer" aria-hidden="true" />
        <svg
          className="wheel-svg"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: transitionMs ? `transform ${transitionMs}ms cubic-bezier(0.32, 0, 0.14, 1)` : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="var(--white)" />
          {participants.map((p, i) => {
            const start = i * wedgeAngle + ANGLE_OFFSET
            const end = start + wedgeAngle
            const color = theme.colors[i % theme.colors.length]
            const mid = start + wedgeAngle / 2
            const label = polarPoint(mid, LABEL_RADIUS)
            return (
              <g key={p.id}>
                <path d={wedgePath(start, end)} fill={color} stroke="var(--white)" strokeWidth={2} />
                {showLabels && (
                  <text
                    x={label.x}
                    y={label.y}
                    fill={wedgeTextColor(theme, color)}
                    fontSize={n > 14 ? 6 : 8}
                    fontFamily="var(--font-body)"
                    fontWeight={700}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${mid}, ${label.x}, ${label.y})`}
                  >
                    {truncateName(p.name)}
                  </text>
                )}
              </g>
            )
          })}
          <circle cx={CENTER} cy={CENTER} r={RIM_RADIUS} fill="none" stroke="var(--ib-blue)" strokeWidth={RIM_WIDTH} />
          {Array.from({ length: LIGHT_COUNT }, (_, i) => {
            const pos = polarPoint((360 / LIGHT_COUNT) * i + ANGLE_OFFSET, RIM_RADIUS)
            return <circle key={i} cx={pos.x} cy={pos.y} r={3.2} fill={i % 2 === 0 ? 'var(--sunshine)' : 'var(--white)'} />
          })}
          {n === 0 && (
            <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-body)" fontSize={10} fill="var(--slate)">
              Add participants
            </text>
          )}
        </svg>
        {n > 0 && <div className="wheel-hub" aria-hidden="true">⭐</div>}
        {celebrating && <ConfettiBurst key={burstKey} theme={themeId} onDone={() => setCelebrating(false)} />}
      </div>

      <button type="button" className="btn btn-primary wheel-spin-btn" onClick={handleSpin} disabled={!canSpin}>
        {spinning ? 'Spinning…' : 'Spin the Wheel'}
      </button>
      {n < 2 && <p className="wheel-hint">{emptyHint ?? 'Add at least 2 participants to spin.'}</p>}
      {!spinning && lastWinnerName && <p className="wheel-winner-line">🎉 {lastWinnerName} wins! 🎉</p>}
    </div>
  )
}
