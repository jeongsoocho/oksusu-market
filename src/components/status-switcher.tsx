'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { setProductStatus } from '@/app/products/actions'
import { STATUSES } from '@/lib/products'

/**
 * 판매 상태 전환 버튼.
 *
 * 누르면 화면을 **먼저** 바꾸고(useOptimistic), 저장은 뒤따라갑니다.
 * 서버에서 실패하면 원래 상태로 되돌아가고 이유를 보여 줍니다.
 */
export function StatusSwitcher({
  productId,
  status,
}: {
  productId: number
  status: string
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function change(next: string) {
    if (next === optimisticStatus) return

    startTransition(async () => {
      setError(null)
      setOptimisticStatus(next)
      const result = await setProductStatus(productId, next)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const selected = optimisticStatus === s.value
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={selected}
              onClick={() => change(s.value)}
              className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition ${
                selected
                  ? 'border-husk-600 bg-husk-500 text-white'
                  : 'border-husk-300 bg-white/80 text-husk-700 hover:bg-white active:scale-95'
              }`}
            >
              {s.label}
            </button>
          )
        })}

        <span
          aria-live="polite"
          className={`text-xs font-bold text-husk-600 transition-opacity ${
            isPending ? 'opacity-100' : 'opacity-0'
          }`}
        >
          저장 중…
        </span>
      </div>

      {error ? <p className="mt-2 text-xs font-bold text-red-600">⚠️ {error}</p> : null}
    </div>
  )
}
