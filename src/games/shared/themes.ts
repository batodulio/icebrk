import type { ColorTheme, ColorThemeId } from './types'

// Shared color-theme system: any game module with a "Color Theme" utility (wheel
// wedges, team colors, board tiles) reuses this instead of hardcoding its own palette.
// Every color here is a brand token from the IceBrk branding guide — themes reorder /
// subset the palette for mood, they never introduce off-brand colors.
export const COLOR_THEMES: Record<ColorThemeId, ColorTheme> = {
  colorful: {
    id: 'colorful',
    label: 'Colorful',
    emoji: '🎨 🌈',
    colors: ['var(--ib-blue)', 'var(--energy-orange)', 'var(--sky-blue)', 'var(--vitality-green)', 'var(--sunshine)', 'var(--purple)'],
    darkTextColors: ['var(--sunshine)'],
  },
  summer: {
    id: 'summer',
    label: 'Summer',
    emoji: '☀️ 🌴',
    colors: ['var(--energy-orange)', 'var(--sunshine)', 'var(--sky-blue)', 'var(--vitality-green)'],
    darkTextColors: ['var(--sunshine)'],
  },
  ocean: {
    id: 'ocean',
    label: 'Ocean',
    emoji: '🌊 🏝️',
    colors: ['var(--ib-blue)', 'var(--sky-blue)', 'var(--vitality-green)', 'var(--purple)'],
    darkTextColors: [],
  },
  night: {
    id: 'night',
    label: 'Night',
    emoji: '🌙 ✨',
    colors: ['var(--ink)', 'var(--purple)', 'var(--ib-blue)', 'var(--sunshine)'],
    darkTextColors: ['var(--sunshine)'],
  },
}

export const COLOR_THEME_LIST: ColorTheme[] = Object.values(COLOR_THEMES)

export function wedgeTextColor(theme: ColorTheme, color: string): string {
  return theme.darkTextColors.includes(color) ? 'var(--ink)' : 'var(--white)'
}
