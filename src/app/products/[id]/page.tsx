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
import { startChatAction } from '@/app/chat/actions'
import { productImageUrls } from '@/lib/storage'
import { ConfirmSubmit } from '@/components/confirm-submit'
import { StatusSwitcher } from '@/components/status-switcher'
import { ProductGallery } from '@/components/product-gallery'
import { FavoriteButton } from '@/components/favorite-button'
import { ShareButton } from '@/components/share-button'
import { btnAccent, btnDanger, btnGhost, card, chip } from '@/lib/styles'

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
  if (!product) return { title: '없는 글' }
  return {
    title: product.title,
    description: `${formatPrice(product.price)} · ${product.region}`,
  }
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

  // 내 글이 아닐 때만 조회수를 올립니다.
  if (!isOwner) {
    await supabase.rpc('increment_product_view', { p_id: product.id })
  }

  let favorited = false
  if (user) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle()
    favorited = Boolean(fav)
  }

  const category = categoryOf(product.category)
  const status = statusOf(product.status)
  const edited = product.updated_at !== product.created_at

  return (
    <article className="animate-pop-in mx-auto max-w-2xl space-y-5">
      <Link href="/products" className="inline-block text-sm font-bold text-ink-soft hover:underline">
        ← 목록으로
      </Link>

      <ProductGallery
        images={productImageUrls(product.images)}
        emoji={category.emoji}
        title={product.title}
        dimmed={product.status === 'sold'}
      />

      <div className={`${card} p-6`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.chip}`}>
            {status.label}
          </span>
          <Link href={`/products?category=${product.category}`} className={chip(false)}>
            {category.emoji} {category.label}
          </Link>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-balance text-ink">{product.title}</h1>

        <p className="mt-1 text-xs text-ink-faint">
          📍 {product.region} · {timeAgo(product.created_at)}
          {edited ? ' · 수정됨' : ''} · 조회 {product.view_count ?? 0}
        </p>

        <p className="font-display mt-3 text-3xl text-ink">{formatPrice(product.price)}</p>

        {product.description ? (
          <p className="mt-5 leading-relaxed whitespace-pre-wrap text-ink">
            {product.description}
          </p>
        ) : (
          <p className="mt-5 text-sm text-ink-faint">설명이 없는 글이에요.</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <FavoriteButton
            productId={product.id}
            initialFavorited={favorited}
            initialCount={product.favorite_count ?? 0}
          />
          <ShareButton title={`${product.title} · 옥수수마켓`} />
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
          <span className="flex size-11 items-center justify-center rounded-full border border-line bg-surface-soft text-xl">
            {product.profiles?.avatar_emoji ?? '🌽'}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">
              {product.profiles?.nickname ?? '알 수 없는 옥수수'}
            </p>
            <p className="text-xs text-ink-faint">판매자</p>
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="rounded-3xl border border-accent/40 bg-accent-soft p-5">
          <p className="text-sm font-bold text-accent-strong">내가 올린 글이에요</p>

          <div className="mt-3">
            <StatusSwitcher productId={product.id} status={product.status} />
          </div>

          <div className="mt-4 flex gap-2">
            <Link href={`/products/${product.id}/edit`} className={`${btnGhost} flex-1`}>
              ✏️ 수정
            </Link>
            <form action={deleteProductAction} className="flex-1">
              <input type="hidden" name="id" value={product.id} />
              <ConfirmSubmit
                message="이 글을 삭제할까요? 사진도 함께 지워지고 되돌릴 수 없어요."
                className={`${btnDanger} w-full`}
              >
                🗑️ 삭제
              </ConfirmSubmit>
            </form>
          </div>
        </div>
      ) : (
        <form action={startChatAction}>
          <input type="hidden" name="productId" value={product.id} />
          <button type="submit" className={`${btnAccent} w-full py-4 text-lg`}>
            💬 판매자와 채팅하기
          </button>
        </form>
      )}
    </article>
  )
}
