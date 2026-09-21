'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { createProductAction, updateProductAction } from '@/app/products/actions'
import { initialProductFormState } from '@/lib/product-form-state'
import { CATEGORIES, type Product } from '@/lib/products'
import { Alert, SubmitButton } from '@/components/ui'

const inputClass =
  'w-full rounded-2xl border-2 border-corn-200 bg-white/90 px-4 py-3 text-cob-900 outline-none transition placeholder:text-cob-500/50 focus:border-corn-400 focus:ring-4 focus:ring-corn-200/60'

export function ProductForm({ product }: { product?: Product }) {
  const isEdit = Boolean(product)
  const [state, formAction] = useActionState(
    isEdit ? updateProductAction : createProductAction,
    initialProductFormState,
  )

  // 가격은 숫자만 담아 두고, 보여줄 때만 콤마를 찍습니다.
  const [price, setPrice] = useState(
    state.values?.price ?? (product ? String(product.price) : ''),
  )

  const v = state.values
  const addPrice = (won: number) =>
    setPrice(String(Math.min(Number(price || 0) + won, 1_000_000_000)))

  return (
    <form action={formAction} className="space-y-5">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-cob-700">제목</span>
        <input
          name="title"
          required
          maxLength={60}
          placeholder="예) 거의 새것 옥수수 찜기 팔아요"
          defaultValue={v?.title ?? product?.title ?? ''}
          className={inputClass}
        />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-cob-700">카테고리</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={c.value}
                required
                defaultChecked={(v?.category ?? product?.category) === c.value}
                className="peer sr-only"
              />
              <span className="block rounded-full border-2 border-corn-200 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-cob-700 transition peer-checked:border-corn-600 peer-checked:bg-corn-300 peer-checked:text-cob-900 peer-focus-visible:ring-4 peer-focus-visible:ring-corn-200">
                {c.emoji} {c.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-cob-700">가격</span>
          <div className="relative">
            <input
              name="price"
              required
              inputMode="numeric"
              placeholder="0"
              value={price === '' ? '' : Number(price).toLocaleString('ko-KR')}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              className={`${inputClass} pr-12`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-cob-500">
              원
            </span>
          </div>
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPrice('0')}
            className="rounded-full border-2 border-husk-300 bg-husk-100 px-3 py-1 text-xs font-bold text-husk-700 transition hover:bg-husk-300/40"
          >
            💝 나눔 (0원)
          </button>
          {[1000, 10000, 100000].map((won) => (
            <button
              key={won}
              type="button"
              onClick={() => addPrice(won)}
              className="rounded-full border-2 border-corn-200 bg-white/80 px-3 py-1 text-xs font-bold text-cob-700 transition hover:bg-corn-100"
            >
              +{won.toLocaleString('ko-KR')}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPrice('')}
            className="rounded-full px-3 py-1 text-xs font-bold text-cob-500 transition hover:bg-corn-100"
          >
            지우기
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-cob-700">거래 지역</span>
        <input
          name="region"
          required
          maxLength={30}
          placeholder="옥수수동"
          defaultValue={v?.region ?? product?.region ?? '옥수수동'}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-cob-700">설명</span>
        <textarea
          name="description"
          rows={7}
          maxLength={2000}
          placeholder="언제 샀는지, 얼마나 썼는지, 흠집은 없는지 적어 주면 더 빨리 팔려요 🌽"
          defaultValue={v?.description ?? product?.description ?? ''}
          className={`${inputClass} resize-y`}
        />
      </label>

      <div className="flex gap-3 pt-1">
        <Link
          href={product ? `/products/${product.id}` : '/products'}
          className="rounded-2xl border-2 border-corn-300 bg-white/80 px-5 py-3.5 font-bold whitespace-nowrap text-cob-700 transition hover:bg-corn-100"
        >
          취소
        </Link>
        <div className="flex-1">
          <SubmitButton>{isEdit ? '수정 완료' : '올리기'}</SubmitButton>
        </div>
      </div>
    </form>
  )
}
