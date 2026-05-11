import { useEffect, useState } from 'react'
import { api } from '../api/client'

export function useCards() {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    api.get('/api/cards/today')
      .then((data) => {
        if (!cancelled) setCards(data.cards)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { cards, loading, error }
}
