// Roulette-specific types. Spin duration options are unique to this game's
// mechanic — other games' Setup Utilities will define their own option sets and
// reuse the shared UtilitySelect component to render them.
export type SpinSeconds = 5 | 10 | 15 | 20 | 25

export const SPIN_SECONDS_OPTIONS: SpinSeconds[] = [5, 10, 15, 20, 25]

export const DEFAULT_SPIN_SECONDS: SpinSeconds = 5
