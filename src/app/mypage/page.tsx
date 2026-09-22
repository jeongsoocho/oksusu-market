import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { PRODUCT_SELECT, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { EmptyState } from '@/components/empty-state'
import { btnGhost, card, sectionTitle } from '@/lib/styles'

export const metadata: Metadata = { title: '내 정보' }

export default async function MyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 미들웨어가 한 번 막아 주지만, 페이지에서도 반드시 다시 확인합니다.
  if (!user) redirect('/login?next=/mypage')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_emoji, region, created_at')
    .eq('id', user.id)
    .maybeSingle()

  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
  const myProducts = (data ?? []) as unknown as Product[]

  const { count: favoriteCount } = await supabase
    .from('favorites')
    .select('product_id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const selling = myProducts.filter((p) => p.status === 'selling').length
  const sold = myProducts.filter((p) => p.status === 'sold').length
  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString('ko-KR')

  return (
    <div className="animate-pop-in mx-auto max-w-2xl space-y-6">
      <div className={`${card} p-6`}>
        <div className="flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full border border-line bg-surface-soft text-4xl">
            {profile?.avatar_emoji ?? '🌽'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-2xl text-ink">
              {profile?.nickname ?? '이름 없는 옥수수'}
            </p>
            <p className="truncate text-sm text-ink-soft">{user.email}</p>
            <p className="mt-1 text-xs text-ink-faint">
              📍 {profile?.region ?? '옥수수동'} · {joined} 가입
            </p>
          </div>
          <Link href="/mypage/edit" className={`${btnGhost} shrink-0 px-3 py-2 text-sm`}>
            수정
          </Link>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-surface-soft p-4 text-center text-sm">
          <div>
            <dt className="text-ink-soft">올린 글</dt>
            <dd className="font-display text-xl text-ink">{myProducts.length}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">판매중</dt>
            <dd className="font-display text-xl text-accent-strong">{selling}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">판매완료</dt>
            <dd className="font-display text-xl text-ink-faint">{sold}</dd>
          </div>
        </dl>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/favorites" className={`${btnGhost} py-2.5 text-sm`}>
            ❤️ 찜한 물건 {favoriteCount ?? 0}
          </Link>
          <Link href="/chat" className={`${btnGhost} py-2.5 text-sm`}>
            💬 채팅
          </Link>
        </div>

        <form action={signOutAction} className="mt-3">
          <button type="submit" className={`${btnGhost} w-full`}>
            로그아웃
          </button>
        </form>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className={sectionTitle}>내가 올린 글</h2>
          <Link
            href="/products/new"
            className="text-sm font-bold whitespace-nowrap text-accent-strong hover:underline"
          >
            + 새 글 쓰기
          </Link>
        </div>

        {myProducts.length === 0 ? (
          <EmptyState
            title="아직 올린 글이 없어요"
            description="서랍 속에 잠든 물건, 한 번 꺼내 볼까요?"
            actionHref="/products/new"
            actionLabel="글 쓰러 가기"
          />
        ) : (
          <ul className="grid gap-3">
            {myProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
