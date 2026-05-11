import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { getUserId } from '../utils/userId'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function readLocalStreak() {
  const v = parseInt(localStorage.getItem('pulse_streak_count') || '0', 10)
  return isNaN(v) ? 0 : v
}

export function useStreak() {
  const [streakCount, setStreakCount] = useState(readLocalStreak)
  const [showCelebration, setShowCelebration] = useState(false)
  const [badgePop, setBadgePop] = useState(false)

  // On mount: fetch current streak from backend, fall back to localStorage
  useEffect(() => {
    api.get(`/api/streak?user_id=${encodeURIComponent(getUserId())}`)
      .then((data) => {
        const count = data.streak_count ?? 0
        setStreakCount(count)
        localStorage.setItem('pulse_streak_count', String(count))
      })
      .catch(() => {
        // backend unavailable — keep localStorage value already in state
      })
  }, [])

  const celebrateIfNew = useCallback(async () => {
    const today = todayISO()
    if (localStorage.getItem('pulse_last_celebrated_date') === today) return

    // Optimistic local update so the UI responds immediately
    const optimistic = readLocalStreak() + 1
    localStorage.setItem('pulse_streak_count', String(optimistic))
    localStorage.setItem('pulse_last_celebrated_date', today)
    setStreakCount(optimistic)
    setShowCelebration(true)
    setBadgePop(true)
    setTimeout(() => setBadgePop(false), 500)

    // Sync to backend; reconcile with server count on success
    try {
      const data = await api.post('/api/streak/ping', {
        user_id: getUserId(),
        date: today,
      })
      const serverCount = data.streak_count ?? optimistic
      setStreakCount(serverCount)
      localStorage.setItem('pulse_streak_count', String(serverCount))
    } catch {
      // keep optimistic value
    }
  }, [])

  const dismissCelebration = useCallback(() => setShowCelebration(false), [])

  return { streakCount, showCelebration, badgePop, celebrateIfNew, dismissCelebration }
}
