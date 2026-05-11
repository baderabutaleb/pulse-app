import './StreakBadge.css'

export default function StreakBadge({ count, pop }) {
  if (count == null) return null

  return (
    <div className={`streak-badge${pop ? ' streak-badge--pop' : ''}`}>
      <span className="streak-fire" aria-hidden="true">🔥</span>
      <span className="streak-number">{count}</span>
    </div>
  )
}
