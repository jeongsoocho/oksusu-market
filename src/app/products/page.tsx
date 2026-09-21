import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, PRODUCT_SELECT, categoryOf, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { EmptyState } from '@/components/empty-state'
import { Alert } from '@/components/ui'

export const metadata: Metadata = { title: '거래 글 · 옥수수마켓 🌽' }

const PAGE_SIZE = 50

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; deleted?: string }>
}) {
  const { q, category, deleted } = await searchParams
  const keyword = (q ?? '').trim().slice(0, 40)
  const activeCategory = CATEGORIES.some((c) => c.value === category) ? category : undefined

  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (activeCategory) query = query.eq('category', activeCategory)
  if (keyword) query = query.ilike('title', `%${keyword}%`)

  const { data, error } = await query
  const products = (data ?? []) as unknown as Product[]

  return (
    <div className="animate-pop-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-cob-900">
          {activeCategory ? `${categoryOf(activeCategory).emoji} ${categoryOf(activeCategory).label}` : '🌽 우리 동네 거래 글'}
        </h1>
        <Link
          href="/products/new"
          className="rounded-2xl bg-corn-400 px-5 py-2.5 font-bold whitespace-nowrap text-cob-900 shadow-[0_3px_0_0_var(--color-corn-600)] transition active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-corn-600)]"
        >
          ✏️ 글 쓰기
        </Link>
      </div>

      {deleted ? <Alert tone="notice">글을 삭제했어요.</Alert> : null}
      {error ? <Alert tone="error">목록을 불러오지 못했어요: {error.message}</Alert> : null}

      {/* 검색 — GET 폼이라 주소창에 ?q= 가 남습니다 */}
      <form method="get" className="flex gap-2">
        {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
        <input
          name="q"
          defaultValue={keyword}
          placeholder="어떤 물건을 찾으세요?"
          className="min-w-0 flex-1 rounded-2xl border-2 border-corn-200 bg-white/90 px-4 py-2.5 outline-none transition placeholder:text-cob-500/50 focus:border-corn-400 focus:ring-4 focus:ring-corn-200/60"
        />
        <button
          type="submit"
          className="rounded-2xl border-2 border-corn-300 bg-white/80 px-4 py-2.5 font-bold whitespace-nowrap text-cob-700 transition hover:bg-corn-100"
        >
          🔍 검색
        </button>
      </form>

      {/* 카테고리 칩 */}
      <div className="flex flex-wrap gap-2">
        <CategoryChip href={buildHref({ keyword })} active={!activeCategory}>
          전체
        </CategoryChip>
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.value}
            href={buildHref({ keyword, category: c.value })}
            active={activeCategory === c.value}
          >
            {c.emoji} {c.label}
          </CategoryChip>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title={keyword || activeCategory ? '찾는 물건이 아직 없어요' : '아직 올라온 글이 없어요'}
          description={
            keyword || activeCategory
              ? '다른 낱말이나 카테고리로 찾아볼까요?'
              : '첫 번째 거래 글의 주인공이 되어 보세요!'
          }
          actionHref="/products/new"
          actionLabel="글 쓰러 가기"
        />
      ) : (
        <>
          <p className="text-sm text-cob-500">{products.length}개의 글</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function buildHref({ keyword, category }: { keyword?: string; category?: string }) {
  const params = new URLSearchParams()
  if (keyword) params.set('q', keyword)
  if (category) params.set('category', category)
  const qs = params.toString()
  return qs ? `/products?${qs}` : '/products'
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
        active
          ? 'border-corn-600 bg-corn-300 text-cob-900'
          : 'border-corn-200 bg-white/80 text-cob-700 hover:bg-corn-100'
      }`}
    >
      {children}
    </Link>
  )
}
