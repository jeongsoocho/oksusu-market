import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { CornMascot } from '@/components/corn-mascot'

export async function SiteHeader() {
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
    nickname = profile?.nickname ?? user.email?.split('@')[0] ?? null
  }

  return (
    <header className="sticky top-0 z-10 border-b-2 border-corn-200 bg-corn-50/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <CornMascot size={34} />
            <span className="font-display whitespace-nowrap text-xl text-cob-900">옥수수마켓</span>
          </Link>
          <Link
            href="/products"
            className="ml-1 rounded-full px-2.5 py-1.5 text-sm font-bold whitespace-nowrap text-cob-700 transition hover:bg-corn-100"
          >
            <span className="sm:hidden">🛍️</span>
            <span className="hidden sm:inline">거래 글</span>
          </Link>
        </div>

        {user ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/mypage"
              className="max-w-[9rem] truncate rounded-full border-2 border-corn-300 bg-white/80 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-cob-700 transition hover:bg-corn-100"
            >
              🌽 {nickname}
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border-2 border-transparent bg-cob-700/10 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-cob-700 transition hover:bg-cob-700/20"
              >
                로그아웃
              </button>
            </form>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap text-cob-700 transition hover:bg-corn-100"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-corn-400 px-3 py-1.5 text-sm font-bold whitespace-nowrap text-cob-900 shadow-[0_3px_0_0_var(--color-corn-600)] transition active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-corn-600)]"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
