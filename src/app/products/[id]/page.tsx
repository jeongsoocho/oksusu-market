import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  PRODUCT_SELECT,
  categoryOf,
  formatPrice,
  statusOf,
  timeAgo,
  type Product,
} from '@/lib/products'
import { deleteProductAction } from '@/app/products/actions'
import { ConfirmSubmit } from '@/components/confirm-submit'
import { StatusSwitcher } from '@/components/status-switcher'

async function getProduct(idParam: string) {
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle()

  return (data as unknown as Product) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  return { title: product ? `${product.title} · 옥수수마켓 🌽` : '없는 글 · 옥수수마켓 🌽' }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === product.seller_id
  const category = categoryOf(product.category)
  const status = statusOf(product.status)
  const edited = product.updated_at !== product.created_at

  return (
    <article className="animate-pop-in mx-auto max-w-2xl space-y-5">
      <Link href="/products" className="inline-block text-sm font-bold text-cob-700 hover:underline">
        ← 목록으로
      </Link>

      <div
        className={`flex h-56 items-center justify-center rounded-3xl border-2 border-corn-200 bg-corn-100 text-8xl ${
          product.status === 'sold' ? 'opacity-50 grayscale' : ''
        }`}
        aria-hidden
      >
        {category.emoji}
      </div>

      <div className="rounded-3xl border-2 border-corn-200 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.chip}`}>
            {status.label}
          </span>
          <Link
            href={`/products?category=${product.category}`}
            className="rounded-full border-2 border-corn-200 px-2.5 py-0.5 text-xs font-semibold text-cob-700 hover:bg-corn-100"
          >
            {category.emoji} {category.label}
          </Link>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-balance text-cob-900">{product.title}</h1>
        <p className="mt-1 text-xs text-cob-500">
          📍 {product.region} · {timeAgo(product.created_at)}
          {edited ? ' · 수정됨' : ''}
        </p>

        <p className="font-display mt-3 text-3xl text-cob-900">{formatPrice(product.price)}</p>

        {product.description ? (
          <p className="mt-5 leading-relaxed whitespace-pre-wrap text-cob-900">
            {product.description}
          </p>
        ) : (
          <p className="mt-5 text-sm text-cob-500">설명이 없는 글이에요.</p>
        )}

        <div className="mt-6 flex items-center gap-3 border-t-2 border-corn-100 pt-4">
          <div className="flex size-11 items-center justify-center rounded-full border-2 border-corn-300 bg-corn-100 text-xl">
            {product.profiles?.avatar_emoji ?? '🌽'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-cob-900">
              {product.profiles?.nickname ?? '알 수 없는 옥수수'}
            </p>
            <p className="text-xs text-cob-500">판매자</p>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="rounded-3xl border-2 border-husk-300 bg-husk-100 p-5">
          <p className="text-sm font-bold text-husk-700">내가 올린 글이에요</p>

          <div className="mt-3">
            <StatusSwitcher productId={product.id} status={product.status} />
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/products/${product.id}/edit`}
              className="flex-1 rounded-2xl border-2 border-husk-300 bg-white/80 px-4 py-2.5 text-center font-bold text-husk-700 transition hover:bg-white"
            >
              ✏️ 수정
            </Link>
            <form action={deleteProductAction} className="flex-1">
              <input type="hidden" name="id" value={product.id} />
              <ConfirmSubmit
                message="이 글을 삭제할까요? 되돌릴 수 없어요."
                className="w-full rounded-2xl border-2 border-red-200 bg-white/80 px-4 py-2.5 font-bold text-red-600 transition hover:bg-red-50"
              >
                🗑️ 삭제
              </ConfirmSubmit>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-corn-200 bg-white/50 p-5 text-center text-sm text-cob-700">
          💬 판매자와 이야기하는 기능은 3단계에서 만들 거예요
        </div>
      )}
    </article>
  )
}
