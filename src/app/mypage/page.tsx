import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { CornMascot } from '@/components/corn-mascot'

export const metadata: Metadata = { title: '내 정보 · 옥수수마켓 🌽' }

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

  const joined = new Date(profile?.created_at ?? user.created_at).toLocaleDateString('ko-KR')

  return (
    <div className="animate-pop-in mx-auto max-w-md">
      <div className="rounded-3xl border-2 border-corn-200 bg-white/80 p-7 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-corn-300 bg-corn-100 text-4xl">
            {profile?.avatar_emoji ?? '🌽'}
          </div>
          <div className="min-w-0">
            <p className="font-display truncate text-2xl text-cob-900">
              {profile?.nickname ?? '이름 없는 옥수수'}
            </p>
            <p className="truncate text-sm text-cob-700">{user.email}</p>
            <p className="mt-1 text-xs text-cob-500">
              📍 {profile?.region ?? '옥수수동'} · {joined} 가입
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 rounded-2xl bg-corn-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-cob-700">판매 중인 물건</dt>
            <dd className="font-bold text-cob-900">0개</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-cob-700">관심 목록</dt>
            <dd className="font-bold text-cob-900">0개</dd>
          </div>
        </dl>

        <p className="mt-4 text-center text-xs text-cob-500">
          상품 기능은 2단계에서 만들 거예요 📦
        </p>

        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-2xl border-2 border-corn-300 bg-white px-4 py-3 font-bold text-cob-700 transition hover:bg-corn-100"
          >
            로그아웃
          </button>
        </form>
      </div>

      <div className="mt-8 flex justify-center opacity-70">
        <CornMascot size={80} wiggle />
      </div>
    </div>
  )
}
