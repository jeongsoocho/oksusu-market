import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, PRODUCT_SELECT, categoryOf, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { EmptyState } from '@/components/empty-state'
import { Alert } from '@/components/ui'
import { btnPrimary, chip, input, pageTitle } from '@/lib/styles'

export const metadata: Metadata = { title: '거래 글' }

const PAGE_SIZE = 50

const SORTS = [
  { value: 'new', label: '최신순' },
  { value: 'cheap', label: '싼 순' },
  { value: 'popular', label: '인기순' },
] as const

type SortValue = (typeof SORTS)[number]['value']

export default async function ProductListPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    hideSold?: string
    deleted?: string
  }>
}) {
  const sp = await searchParams
  const keyword = (sp.q ?? '').trim().slice(0, 40)
  const activeCategory = CATEGORIES.some((c) => c.value === sp.category) ? sp.category : undefined
  const sort = (SORTS.some((s) => s.value === sp.sort) ? sp.sort : 'new') as SortValue
  const hideSold = sp.hideSold === '1'

  const supabase = await createClient()
  let query = supabase.from('products').select(PRODUCT_SELECT).limit(PAGE_SIZE)

  if (activeCategory) query = query.eq('category', activeCategory)
  if (hideSold) query = query.neq('status', 'sold')
  // 제목과 설명을 함께 찾습니다.
  if (keyword) query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)

  if (sort === 'cheap') query = query.order('price', { ascending: true })
  else if (sort === 'popular') query = query.order('favorite_count', { ascending: false })
  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  const products = (data ?? []) as unknown as Product[]

  /** 지금 조건을 유지한 채 한 가지만 바꾼 주소를 만듭니다. */
  function hrefWith(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { q: keyword, category: activeCategory, sort, hideSold: hideSold ? '1' : undefined, ...patch }
    for (const [key, value] of Object.entries(merged)) {
      if (value && !(key === 'sort' && value === 'new')) params.set(key, value)
    }
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <div className="animate-pop-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className={pageTitle}>
          {activeCategory
            ? `${categoryOf(activeCategory).emoji} ${categoryOf(activeCategory).label}`
            : '🌽 우리 동네 거래 글'}
        </h1>
        <Link href="/products/new" className={`${btnPrimary} hidden py-2.5 sm:inline-flex`}>
          ✏️ 글 쓰기
        </Link>
      </div>

      {sp.deleted ? <Alert tone="notice">글을 삭제했어요.</Alert> : null}
      {error ? <Alert tone="error">목록을 불러오지 못했어요: {error.message}</Alert> : null}

      <form method="get" className="flex gap-2">
        {activeCategory ? <input type="hidden" name="category" value={activeCategory} /> : null}
        {sort !== 'new' ? <input type="hidden" name="sort" value={sort} /> : null}
        {hideSold ? <input type="hidden" name="hideSold" value="1" /> : null}
        <input
          name="q"
          defaultValue={keyword}
          placeholder="어떤 물건을 찾으세요?"
          className={`${input} min-w-0 flex-1 py-2.5`}
        />
        <button type="submit" className={chip(false)}>
          🔍 검색
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <Link key={s.value} href={hrefWith({ sort: s.value })} className={chip(sort === s.value)}>
            {s.label}
          </Link>
        ))}
        <Link
          href={hrefWith({ hideSold: hideSold ? undefined : '1' })}
          className={chip(hideSold)}
        >
          {hideSold ? '✅' : '⬜'} 판매완료 숨기기
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={hrefWith({ category: undefined })} className={chip(!activeCategory)}>
          전체
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={hrefWith({ category: c.value })}
            className={chip(activeCategory === c.value)}
          >
            {c.emoji} {c.label}
          </Link>
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
          <p className="text-sm text-ink-faint">{products.length}개의 글</p>
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
