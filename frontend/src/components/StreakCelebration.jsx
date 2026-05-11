import { useEffect, useState } from 'react'
import './StreakCelebration.css'

const PARTICLE_COUNT = 12
const DISMISS_AFTER_MS = 2800
const FADE_OUT_AFTER_MS = 2400

export default function StreakCelebration({ streakCount, onDismiss }) {
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), FADE_OUT_AFTER_MS)
    const dismissTimer = setTimeout(() => onDismiss(), DISMISS_AFTER_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [onDismiss])

  return (
    <div className={`celebration-overlay${fadingOut ? ' celebration-overlay--out' : ''}`}>
      <div className="celebration-center">
        <div className="celebration-fire-wrap">
          {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
            <div
              key={i}
              className="celebration-particle"
              style={{ '--angle': `${i * (360 / PARTICLE_COUNT)}deg` }}
            />
          ))}
          <span className="celebration-fire" role="img" aria-label="fire">🔥</span>
        </div>

        <div className="celebration-number">{streakCount}</div>
        <div className="celebration-label">day streak</div>
        <div className="celebration-message">You&rsquo;re on fire. Come back tomorrow.</div>
      </div>
    </div>
  )
}
