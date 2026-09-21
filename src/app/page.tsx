import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CornMascot } from '@/components/corn-mascot'

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

  return (
    <div className="animate-pop-in flex flex-col items-center text-center">
      <CornMascot size={170} wiggle />

      <h1 className="font-display mt-6 text-4xl text-cob-900 sm:text-5xl">
        옥수수마켓
      </h1>
      <p className="mt-3 max-w-md text-balance text-cob-700">
        알맹이처럼 촘촘한 우리 동네 중고거래.
        <br />
        쓰지 않는 물건에 새 주인을 찾아 주세요 🌽
      </p>

      {user ? (
        <div className="mt-8 w-full max-w-md rounded-3xl border-2 border-corn-200 bg-white/80 p-6 shadow-sm">
          <p className="text-lg font-bold text-cob-900">
            어서 와요, {nickname ?? '옥수수'}님! 👋
          </p>
          <p className="mt-2 text-sm text-cob-700">
            로그인이 잘 되었어요. 상품 등록 기능은 다음 단계에서 만들 거예요.
          </p>
          <Link
            href="/mypage"
            className="mt-5 inline-block rounded-2xl bg-husk-500 px-5 py-2.5 font-bold text-white shadow-[0_3px_0_0_var(--color-husk-700)] transition active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-husk-700)]"
          >
            내 정보 보기
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-2xl bg-corn-400 px-7 py-3.5 text-lg font-bold text-cob-900 shadow-[0_4px_0_0_var(--color-corn-600)] transition active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-corn-600)]"
          >
            회원가입하기
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border-2 border-corn-300 bg-white/80 px-7 py-3.5 text-lg font-bold text-cob-700 transition hover:bg-corn-100"
          >
            로그인
          </Link>
        </div>
      )}

      <section className="mt-14 grid w-full gap-4 sm:grid-cols-3">
        {[
          { emoji: '🌽', title: '1단계 · 회원', desc: '가입 · 로그인 · 로그아웃', done: true },
          { emoji: '📦', title: '2단계 · 상품', desc: '상품 등록과 목록', done: false },
          { emoji: '💬', title: '3단계 · 채팅', desc: '판매자와 이야기하기', done: false },
        ].map((step) => (
          <div
            key={step.title}
            className={`rounded-3xl border-2 p-5 text-left ${
              step.done
                ? 'border-husk-300 bg-husk-100'
                : 'border-dashed border-corn-200 bg-white/50'
            }`}
          >
            <div className="text-2xl">{step.emoji}</div>
            <p className="mt-2 font-bold text-cob-900">{step.title}</p>
            <p className="text-sm text-cob-700">{step.desc}</p>
            <p className="mt-2 text-xs font-bold text-husk-600">
              {step.done ? '✅ 완료' : '⏳ 준비 중'}
            </p>
          </div>
        ))}
      </section>
    </div>
  )
}
