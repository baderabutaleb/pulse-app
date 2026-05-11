import './App.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import CardDeck from './components/CardDeck'
import LoadingPulse from './components/LoadingPulse'
import StreakBadge from './components/StreakBadge'
import StreakCelebration from './components/StreakCelebration'
import { useCards } from './hooks/useCards'
import { useStreak } from './hooks/useStreak'

function blendWithDark(hex, alpha = 0.18) {
  if (!hex || hex.length < 7) return '#0a0a0f'
  try {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const br = Math.round(r * alpha + 10 * (1 - alpha))
    const bg = Math.round(g * alpha + 10 * (1 - alpha))
    const bb = Math.round(b * alpha + 15 * (1 - alpha))
    return `#${br.toString(16).padStart(2, '0')}${bg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`
  } catch {
    return '#0a0a0f'
  }
}

export default function App() {
  const { cards, loading, error } = useCards()
  const { streakCount, showCelebration, badgePop, celebrateIfNew, dismissCelebration } = useStreak()
  const [activeIndex, setActiveIndex] = useState(0)
  const bgRef = useRef(null)
  const cardsLenRef = useRef(0)

  useEffect(() => {
    if (cards) cardsLenRef.current = cards.length
  }, [cards])

  useEffect(() => {
    if (!cards) return
    const color = blendWithDark(cards[activeIndex]?.theme_color)
    if (bgRef.current) {
      bgRef.current.style.background = `radial-gradient(ellipse at 30% 20%, ${color} 0%, #0a0a0f 60%)`
    }
  }, [cards, activeIndex])

  const handleActiveCardChange = useCallback((index) => {
    setActiveIndex(index)
    if (index === cardsLenRef.current - 1) {
      celebrateIfNew()
    }
  }, [celebrateIfNew])

  if (loading) {
    return (
      <div className="app">
        <LoadingPulse />
      </div>
    )
  }

  if (error) {
    return (
      <div className="app app--error">
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '24px' }}>
          Could not load today&rsquo;s cards.
          <br />
          <span style={{ fontSize: '13px' }}>{error}</span>
        </p>
      </div>
    )
  }

  return (
    <div
      className="app"
      ref={bgRef}
      style={{ transition: 'background 0.7s ease' }}
    >
      <StreakBadge count={streakCount} pop={badgePop} />
      <CardDeck cards={cards} onActiveCardChange={handleActiveCardChange} />
      {showCelebration && (
        <StreakCelebration
          streakCount={streakCount}
          onDismiss={dismissCelebration}
        />
      )}
    </div>
  )
}
