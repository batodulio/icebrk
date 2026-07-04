// Two Truths & a Lie-specific types. Each player gets one spotlight turn: they say
// two truths and one lie out loud, the room votes, and the host records whether the
// room was fooled — no statement data entry needed, the app runs the flow.

/** Outcome of a player's spotlight turn. */
export type TtlVerdict = 'fooled' | 'caught'

/** 0 = no timer; otherwise seconds of guessing time per turn. */
export type TtlTimerSeconds = 0 | 30 | 60 | 90

export const TTL_TIMER_OPTIONS: TtlTimerSeconds[] = [0, 30, 60, 90]

export const DEFAULT_TTL_TIMER: TtlTimerSeconds = 0
