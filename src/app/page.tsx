import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CornMascot } from '@/components/corn-mascot'
import { ProductCard } from '@/components/product-card'
import { EmptyState } from '@/components/empty-state'
import { CATEGORIES, PRODUCT_SELECT, type Product } from '@/lib/products'
import { btnGhost, btnPrimary, card, chip, sectionTitle } from '@/lib/styles'

const ROADMAP = [
  { emoji: '🌽', title: '1단계 · 회원', desc: '가입 · 로그인 · 로그아웃', done: true },
  { emoji: '📦', title: '2단계 · 거래 글', desc: '쓰기 · 보기 · 수정 · 삭제', done: true },
  { emoji: '📸', title: '3단계 · 사진', desc: '한 글에 최대 5장', done: true },
  { emoji: '❤️', title: '4단계 · 찜', desc: '마음에 든 물건 모아보기', done: true },
  { emoji: '💬', title: '5단계 · 채팅', desc: '판매자와 실시간 대화', done: true },
  { emoji: '🔔', title: '다음', desc: '알림 · 거래 후기', done: false },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nickname: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle()
    nickname = profile?.nickname ?? null
  }

  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false })
    .limit(4)
  const recent = (data ?? []) as unknown as Product[]

  return (
    <div className="animate-pop-in space-y-14">
      <section className="flex flex-col items-center text-center">
        <CornMascot size={160} wiggle />

        <h1 className="font-display mt-6 text-4xl text-ink sm:text-5xl">옥수수마켓</h1>
        <p className="mt-3 max-w-md text-balance text-ink-soft">
          알맹이처럼 촘촘한 우리 동네 중고거래.
          <br />
          쓰지 않는 물건에 새 주인을 찾아 주세요 🌽
        </p>

        {user ? (
          <div className={`${card} mt-8 w-full max-w-md p-6`}>
            <p className="text-lg font-bold text-ink">어서 와요, {nickname ?? '옥수수'}님! 👋</p>
            <p className="mt-2 text-sm text-ink-soft">오늘은 어떤 물건을 내놓을까요?</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <Link href="/products/new" className={`${btnPrimary} py-2.5`}>
                ✏️ 글 쓰기
              </Link>
              <Link href="/favorites" className={`${btnGhost} py-2.5`}>
                ❤️ 찜한 물건
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={`${btnPrimary} px-7 py-3.5 text-lg`}>
              구경하러 가기
            </Link>
            <Link href="/signup" className={`${btnGhost} px-7 py-3.5 text-lg`}>
              회원가입
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className={`${sectionTitle} mb-3`}>어떤 걸 찾으세요?</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.value} href={`/products?category=${c.value}`} className={chip(false)}>
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className={sectionTitle}>방금 올라온 물건</h2>
          <Link
            href="/products"
            className="text-sm font-bold whitespace-nowrap text-accent-strong hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            title="아직 올라온 글이 없어요"
            description="첫 번째 거래 글의 주인공이 되어 보세요!"
            actionHref="/products/new"
            actionLabel="글 쓰러 가기"
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {recent.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROADMAP.map((step) => (
          <div
            key={step.title}
            className={`rounded-3xl border p-5 ${
              step.done
                ? 'border-accent/40 bg-accent-soft'
                : 'border-dashed border-line bg-surface/50'
            }`}
          >
            <div className="text-2xl">{step.emoji}</div>
            <p className="mt-2 font-bold text-ink">{step.title}</p>
            <p className="text-sm text-ink-soft">{step.desc}</p>
            <p className="mt-2 text-xs font-bold text-accent-strong">
              {step.done ? '✅ 완료' : '⏳ 준비 중'}
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
