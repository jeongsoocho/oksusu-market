'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/app/products/favorite-actions'

/**
 * 찜 하트.
 * 누르면 바로 색이 차고 숫자가 오르며, 저장은 뒤따라갑니다.
 * 실패하면 원래대로 되돌리고 이유를 알려 줍니다.
 */
export function FavoriteButton({
  productId,
  initialFavorited,
  initialCount,
  size = 'md',
}: {
  productId: number
  initialFavorited: boolean
  initialCount: number
  size?: 'sm' | 'md'
}) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [message, setMessage] = useState<string | null>(null)
  const [beat, setBeat] = useState(0)
  const [, startTransition] = useTransition()

  function click() {
    const next = !favorited
    const prevCount = count

    setFavorited(next)
    setCount((c) => Math.max(0, c + (next ? 1 : -1)))
    setMessage(null)
    if (next) setBeat((n) => n + 1)

    startTransition(async () => {
      const result = await toggleFavorite(productId, next)
      if (result.error) {
        setFavorited(!next)
        setCount(prevCount)
        setMessage(result.error)
        if (result.needLogin) router.push(`/login?next=/products/${productId}`)
      }
    })
  }

  const big = size === 'md'

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={click}
        aria-pressed={favorited}
        aria-label={favorited ? '찜 빼기' : '찜하기'}
        className={`inline-flex items-center gap-1.5 rounded-full border font-bold transition ${
          big ? 'px-4 py-2.5 text-base' : 'px-2.5 py-1 text-xs'
        } ${
          favorited
            ? 'border-heart/40 bg-heart/10 text-heart'
            : 'border-line bg-surface text-ink-soft hover:bg-surface-soft'
        }`}
      >
        <span key={beat} className={favorited ? 'animate-heart' : ''} aria-hidden>
          {favorited ? '❤️' : '🤍'}
        </span>
        {count > 0 ? count : big ? '찜' : ''}
      </button>

      {message ? <span className="mt-1 text-xs font-bold text-danger">{message}</span> : null}
    </div>
  )
}
