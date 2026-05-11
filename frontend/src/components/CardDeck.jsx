import { useCallback, useRef, useState } from 'react'
import PosterCard from './PosterCard'
import './CardDeck.css'

const SWIPE_THRESHOLD = 72
const EXIT_DURATION = 380

export default function CardDeck({ cards, onActiveCardChange }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDir, setExitDir] = useState(null)   // 'left' | 'right' | null
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const animating = useRef(false)

  const canNext = currentIndex < cards.length - 1
  const canPrev = currentIndex > 0

  const navigate = useCallback((dir) => {
    if (animating.current) return
    if (dir === 'next' && !canNext) return
    if (dir === 'prev' && !canPrev) return

    animating.current = true
    setExitDir(dir === 'next' ? 'left' : 'right')
    setDragX(0)

    const nextIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1

    setTimeout(() => {
      setCurrentIndex(nextIndex)
      setExitDir(null)
      animating.current = false
      onActiveCardChange?.(nextIndex)
    }, EXIT_DURATION)
  }, [canNext, canPrev, currentIndex, onActiveCardChange])

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const onTouchMove = (e) => {
    if (!isDragging) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    if (Math.abs(dragX) >= SWIPE_THRESHOLD) {
      navigate(dragX < 0 ? 'next' : 'prev')
    } else {
      setDragX(0)
    }
  }

  // dragProgress drives peek-card scale/position during forward swipes only
  const forwardDragProgress =
    exitDir === 'left'
      ? 1
      : !exitDir && dragX < 0
      ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)
      : 0

  const getCardStyle = (actualIndex) => {
    const pos = actualIndex - currentIndex  // -1, 0, 1, 2

    switch (pos) {
      case -1:
        // Previous card — hidden off-screen-left normally,
        // slides in when the active card exits right (backward nav)
        if (exitDir === 'right') {
          return {
            transform: 'translateX(0) rotate(0deg) scale(1)',
            opacity: 1,
            zIndex: 10,
            transition: `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${EXIT_DURATION}ms ease`,
          }
        }
        return {
          transform: 'translateX(-115%) rotate(14deg)',
          opacity: 0,
          zIndex: 7,
          transition: 'none',
        }

      case 0:
        // Active card
        if (exitDir) {
          const dir = exitDir === 'left' ? -1 : 1
          return {
            transform: `translateX(${dir * 115}%) rotate(${dir * -14}deg)`,
            opacity: 0,
            zIndex: 10,
            transition: `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${EXIT_DURATION}ms ease`,
          }
        }
        return {
          transform: `translateX(${dragX}px) rotate(${dragX * 0.045}deg)`,
          opacity: 1,
          zIndex: 10,
          transition: isDragging ? 'none' : 'transform 0.18s ease',
        }

      case 1: {
        const scale = 0.93 + 0.07 * forwardDragProgress
        const y = -10 + 10 * forwardDragProgress
        return {
          transform: `translateY(${y}px) scale(${scale})`,
          opacity: 1,
          zIndex: 9,
          transition: isDragging ? 'none' : `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }
      }

      case 2: {
        const scale = 0.86 + 0.07 * forwardDragProgress
        const y = -20 + 10 * forwardDragProgress
        return {
          transform: `translateY(${y}px) scale(${scale})`,
          opacity: 1,
          zIndex: 8,
          transition: isDragging ? 'none' : `transform ${EXIT_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }
      }

      default:
        return { display: 'none' }
    }
  }

  // Render: one card behind + active + two peeking ahead
  const start = Math.max(0, currentIndex - 1)
  const end = Math.min(cards.length, currentIndex + 3)
  const visibleCards = cards.slice(start, end)

  return (
    <div className="card-deck">
      <div className="card-counter">
        <span className="counter-current">{currentIndex + 1}</span>
        <span className="counter-sep"> / </span>
        <span className="counter-total">{cards.length}</span>
      </div>

      <div
        className="card-stack"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {visibleCards.map((card, i) => {
          const actualIndex = start + i
          return (
            <div
              key={card.id}
              className="card-wrapper"
              style={getCardStyle(actualIndex)}
            >
              <PosterCard card={card} />
            </div>
          )
        })}
      </div>

      <div className="card-nav">
        <button
          className="nav-btn"
          onClick={() => navigate('prev')}
          disabled={!canPrev}
          aria-label="Previous card"
        >
          ←
        </button>
        <button
          className="nav-btn"
          onClick={() => navigate('next')}
          disabled={!canNext}
          aria-label="Next card"
        >
          →
        </button>
      </div>
    </div>
  )
}
