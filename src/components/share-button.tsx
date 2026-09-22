'use client'

import { useState } from 'react'

/**
 * 공유하기.
 * 폰에서는 카카오톡 같은 앱 목록이 뜨고(웹 공유 기능),
 * 안 되는 브라우저에서는 주소를 클립보드에 복사합니다.
 */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // 사용자가 공유창을 닫은 경우 — 복사로 넘어갑니다.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 font-bold text-ink-soft transition hover:bg-surface-soft hover:text-ink"
    >
      {copied ? '✅ 주소 복사됨' : '🔗 공유'}
    </button>
  )
}
