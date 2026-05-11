import { useCallback, useState } from 'react'
import { api } from '../api/client'

function getOrCreateDeviceId() {
  let id = localStorage.getItem('pulse_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('pulse_device_id', id)
  }
  return id
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function readStreakCount() {
  const v = parseInt(localStorage.getItem('pulse_streak_count') || '0', 10)
  return isNaN(v) ? 0 : v
}

export function useStreak() {
  const [streakCount, setStreakCount] = useState(readStreakCount)
  const [showCelebration, setShowCelebration] = useState(false)
  const [badgePop, setBadgePop] = useState(false)

  const celebrateIfNew = useCallback(() => {
    const today = todayISO()
    if (localStorage.getItem('pulse_last_celebrated_date') === today) return

    const newCount = readStreakCount() + 1
    localStorage.setItem('pulse_streak_count', String(newCount))
    localStorage.setItem('pulse_last_celebrated_date', today)

    setStreakCount(newCount)
    setShowCelebration(true)
    setBadgePop(true)
    setTimeout(() => setBadgePop(false), 500)

    // fire-and-forget API sync
    api.post('/api/streak/ping', { device_id: getOrCreateDeviceId() }).catch(() => {})
  }, [])

  const dismissCelebration = useCallback(() => setShowCelebration(false), [])

  return { streakCount, showCelebration, badgePop, celebrateIfNew, dismissCelebration }
}
