import './LoadingPulse.css'

function SkeletonCard({ stackPos }) {
  const style = stackPos === 1
    ? { transform: 'translateY(-10px) scale(0.93)', zIndex: 9 }
    : stackPos === 2
    ? { transform: 'translateY(-20px) scale(0.86)', zIndex: 8 }
    : { zIndex: 10 }

  return (
    <div className="skeleton-card" style={style}>
      <div className="skeleton-top">
        <div className="shimmer skeleton-emoji" />
        <div className="shimmer skeleton-category" />
      </div>
      <div className="skeleton-headline">
        <div className="shimmer skeleton-line" style={{ width: '92%' }} />
        <div className="shimmer skeleton-line" style={{ width: '78%' }} />
        <div className="shimmer skeleton-line" style={{ width: '60%' }} />
      </div>
      <div className="skeleton-bottom">
        <div className="shimmer skeleton-line" style={{ width: '100%' }} />
        <div className="shimmer skeleton-line" style={{ width: '95%' }} />
        <div className="shimmer skeleton-line" style={{ width: '60%' }} />
        <div className="shimmer skeleton-source" />
      </div>
    </div>
  )
}

export default function LoadingPulse() {
  return (
    <div className="loading-pulse">
      <div className="skeleton-counter shimmer" />
      <div className="skeleton-stack">
        <SkeletonCard stackPos={2} />
        <SkeletonCard stackPos={1} />
        <SkeletonCard stackPos={0} />
      </div>
    </div>
  )
}
