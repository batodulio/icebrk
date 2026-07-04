import UtilitySelect from '../shared/UtilitySelect'
import { COLOR_THEME_LIST, COLOR_THEMES } from '../shared/themes'
import type { ColorThemeId } from '../shared/types'
import { AUTO_CALL_OPTIONS, BINGO_LETTERS, CARD_COUNT_OPTIONS, type AutoCallSeconds, type BingoCard } from './types'

interface BingoCustomizeTabProps {
  cards: BingoCard[]
  cardCount: number
  onCardCountChange: (count: number) => void
  onRegenerate: () => void
  autoCallSeconds: AutoCallSeconds
  onAutoCallChange: (value: AutoCallSeconds) => void
  themeId: ColorThemeId
  onThemeChange: (value: ColorThemeId) => void
}

// Playful labels per auto-call pace.
const AUTO_CALL_LABELS: Record<AutoCallSeconds, string> = {
  0: '🎙️ Call manually',
  5: '⚡ Every 5 seconds',
  8: '🎈 Every 8 seconds',
  12: '🐢 Every 12 seconds',
}

/**
 * Tab 1 — Customize Game: generate player cards (print or screenshot them for the
 * room) and set the calling pace + look.
 */
export default function BingoCustomizeTab({
  cards,
  cardCount,
  onCardCountChange,
  onRegenerate,
  autoCallSeconds,
  onAutoCallChange,
  themeId,
  onThemeChange,
}: BingoCustomizeTabProps) {
  const theme = COLOR_THEMES[themeId]

  return (
    <div className="customize-tab">
      <div className="customize-settings">
        <h3 className="customize-settings-title">⚙️ Game Settings</h3>
        <div className="setup-tab">
          <UtilitySelect
            label="Auto-Call Pace"
            accent="var(--sky-blue)"
            value={String(autoCallSeconds)}
            options={AUTO_CALL_OPTIONS.map((s) => ({ value: String(s), label: AUTO_CALL_LABELS[s] }))}
            onChange={(value) => onAutoCallChange(Number(value) as AutoCallSeconds)}
          />
          <UtilitySelect
            label="Color Theme"
            accent="var(--purple)"
            value={themeId}
            options={COLOR_THEME_LIST.map((t) => ({ value: t.id, label: `${t.emoji} ${t.label}` }))}
            onChange={(value) => onThemeChange(value as ColorThemeId)}
          />
        </div>
      </div>

      <div className="customize-card">
        <div className="customize-card-head">
          <h3>🎟️ Player Cards</h3>
          <span className="participant-count-badge">{cards.length} cards</span>
        </div>
        <p className="customize-card-hint">
          Deal a card to every player — print this page, screenshot it, or let players copy one onto paper. Reshuffle for fresh cards.
        </p>
        <div className="customize-card-actions">
          <select
            className="bng-count-select"
            value={String(cardCount)}
            onChange={(e) => onCardCountChange(Number(e.target.value))}
            aria-label="Number of cards"
          >
            {CARD_COUNT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} cards
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={onRegenerate}>
            🔀 Shuffle Cards
          </button>
        </div>
        <div className="bng-card-grid">
          {cards.map((card, cardIndex) => (
            <div className="bng-card" key={card.id}>
              <div className="bng-card-title">Card {cardIndex + 1}</div>
              <div className="bng-card-table">
                {BINGO_LETTERS.map((letter, i) => (
                  <div className="bng-card-letter" key={letter} style={{ background: theme.colors[i % theme.colors.length] }}>
                    {letter}
                  </div>
                ))}
                {card.rows.map((row, r) =>
                  row.map((cell, c) => (
                    <div className={`bng-card-cell ${cell === 'FREE' ? 'free' : ''}`} key={`${r}-${c}`}>
                      {cell === 'FREE' ? '★' : cell}
                    </div>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
