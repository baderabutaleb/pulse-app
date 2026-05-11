import { useEffect, useState } from 'react'
import './PosterCard.css'

function useCardImage(sourceUrl) {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(!!sourceUrl)

  useEffect(() => {
    if (!sourceUrl) { setLoading(false); return }
    const controller = new AbortController()

    fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(sourceUrl)}&screenshot=false&meta=true`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const url = data?.data?.image?.url
        if (url) setImageUrl(url)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [sourceUrl])

  return { imageUrl, loading }
}

export default function PosterCard({ card }) {
  const {
    emoji,
    category,
    headline,
    summary,
    source_name,
    source_url,
    theme_color,
  } = card

  const { imageUrl, loading: imageLoading } = useCardImage(source_url)

  return (
    <article
      className="poster-card"
      style={{
        '--theme': theme_color,
        background: `linear-gradient(175deg, ${theme_color}cc 0%, #0a0a0f 72%)`,
        borderLeft: `4px solid ${theme_color}`,
      }}
    >
      <div className="poster-top">
        <span className="poster-emoji" role="img" aria-hidden="true">{emoji}</span>
        <span className="poster-category">{category}</span>
      </div>

      <div className="poster-panel">
        <h2 className="poster-headline">{headline}</h2>

        <div className="poster-image-wrap">
          {imageLoading ? (
            <div className="poster-image-shimmer" />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              className="poster-image"
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div
              className="poster-image-fallback"
              style={{ background: `linear-gradient(135deg, ${theme_color}55 0%, ${theme_color}11 100%)` }}
            />
          )}
        </div>

        <div className="poster-bottom">
          <p className="poster-summary">{summary}</p>

          {source_url ? (
            <a
              className="poster-source"
              href={source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="source-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 2h5v5M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {source_name}
            </a>
          ) : (
            <span className="poster-source">{source_name}</span>
          )}
        </div>
      </div>
    </article>
  )
}
