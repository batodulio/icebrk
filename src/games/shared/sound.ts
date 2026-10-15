// Shared sound system — synthesized via Web Audio so no binary audio assets need to
// ship in the repo. Any game module can reuse `soundManager` for its own cues
// (ticks/whooshes for build-up, a fanfare for a celebratory reveal) rather than
// building a bespoke audio pipeline per game.

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  if (!ctx) ctx = new AudioCtor()
  return ctx
}

/** Must be called from within a user gesture (e.g. the spin button click) to satisfy browser autoplay policy. */
function unlock(): void {
  const audioCtx = getContext()
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
}

let spinTimers: number[] = []

function clearSpinTimers(): void {
  spinTimers.forEach((id) => window.clearTimeout(id))
  spinTimers = []
}

function playClick(audioCtx: AudioContext, time: number, gainValue: number): void {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(720, time)
  gain.gain.setValueAtTime(gainValue, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start(time)
  osc.stop(time + 0.06)
}

/**
 * Plays a ratchet-style tick sequence across the spin duration, evenly spaced but
 * slowing down towards the end — mirrors a physical wheel losing momentum.
 */
function playSpinTicks(durationMs: number): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  unlock()
  clearSpinTimers()

  const totalTicks = Math.round(durationMs / 90)
  const startTime = audioCtx.currentTime + 0.02

  for (let i = 0; i < totalTicks; i++) {
    // Ease-out spacing: ticks land closer together early, further apart later.
    const progress = i / totalTicks
    const eased = 1 - Math.pow(1 - progress, 2)
    const offsetSeconds = (eased * durationMs) / 1000
    const gainValue = 0.05 + 0.03 * (1 - progress)
    playClick(audioCtx, startTime + offsetSeconds, gainValue)
  }
}

/** Short ascending arpeggio for a winner reveal. */
function playWinnerFanfare(): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  unlock()

  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  const startTime = audioCtx.currentTime + 0.02

  notes.forEach((freq, i) => {
    const time = startTime + i * 0.11
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.linearRampToValueAtTime(0.09, time + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start(time)
    osc.stop(time + 0.42)
  })
}

/** Short rising two-note blip for small reveals (bingo draws, answer reveals). */
function playDrawPop(): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  unlock()

  const notes = [523.25, 783.99] // C5 G5
  const startTime = audioCtx.currentTime + 0.02

  notes.forEach((freq, i) => {
    const time = startTime + i * 0.09
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.linearRampToValueAtTime(0.08, time + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start(time)
    osc.stop(time + 0.18)
  })
}

/** Two-note descending buzz for "time's up" moments (discussion timers, round ends). */
function playTimerUp(): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  unlock()

  const notes = [440, 330]
  const startTime = audioCtx.currentTime + 0.02

  notes.forEach((freq, i) => {
    const time = startTime + i * 0.18
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.001, time)
    gain.gain.linearRampToValueAtTime(0.07, time + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start(time)
    osc.stop(time + 0.3)
  })
}

/**
 * Long, low game-show buzzer for a hard "time's up" (Jeopardy's answer clock).
 * Two slightly detuned sawtooths beat against each other for the classic rasp,
 * and a lowpass filter takes the harsh edge off the top.
 */
function playBuzzer(): void {
  const audioCtx = getContext()
  if (!audioCtx) return
  unlock()

  const start = audioCtx.currentTime + 0.02
  const duration = 0.85

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1400, start)

  const gain = audioCtx.createGain()
  gain.gain.setValueAtTime(0.001, start)
  gain.gain.linearRampToValueAtTime(0.14, start + 0.03)
  gain.gain.setValueAtTime(0.14, start + duration - 0.12)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  filter.connect(gain).connect(audioCtx.destination)

  for (const freq of [146.83, 151]) {
    const osc = audioCtx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, start)
    osc.connect(filter)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  }
}

function stopAll(): void {
  clearSpinTimers()
}

export const soundManager = {
  unlock,
  playSpinTicks,
  playWinnerFanfare,
  playDrawPop,
  playTimerUp,
  playBuzzer,
  stopAll,
}
