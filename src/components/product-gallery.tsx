'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * 상품 사진 보기.
 * 사진이 없으면 지금처럼 카테고리 이모지를 크게 보여 줍니다.
 */
export function ProductGallery({
  images,
  emoji,
  title,
  dimmed = false,
}: {
  images: string[]
  emoji: string
  title: string
  dimmed?: boolean
}) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div
        className={`flex h-56 items-center justify-center rounded-3xl border border-line bg-surface-soft text-8xl ${
          dimmed ? 'opacity-50 grayscale' : ''
        }`}
        aria-hidden
      >
        {emoji}
      </div>
    )
  }

  const safeIndex = Math.min(current, images.length - 1)

  return (
    <div>
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-surface-soft ${
          dimmed ? 'opacity-50 grayscale' : ''
        }`}
      >
        <Image
          src={images[safeIndex]}
          alt={`${title} 사진 ${safeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={index === safeIndex}
              className={`relative size-16 overflow-hidden rounded-xl border-2 transition ${
                index === safeIndex
                  ? 'border-brand-strong ring-2 ring-brand/40'
                  : 'border-line opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
