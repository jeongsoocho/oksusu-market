import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/auth/actions'
import { CornMascot } from '@/components/corn-mascot'
import { ThemeToggle } from '@/components/theme-toggle'
import { btnQuiet } from '@/lib/styles'

const NAV = [
  { href: '/products', label: '거래 글' },
  { href: '/chat', label: '채팅' },
]

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nickname: string | null = null
  let emoji = '🌽'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, avatar_emoji')
      .eq('id', user.id)
      .maybeSingle()
    nickname = profile?.nickname ?? user.email?.split('@')[0] ?? null
    emoji = profile?.avatar_emoji ?? '🌽'
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <CornMascot size={32} />
            <span className="font-display whitespace-nowrap text-xl text-ink">옥수수마켓</span>
          </Link>

          {/* 폰에서는 아래 탭바가 있으니 가로 메뉴는 숨깁니다 */}
          <nav className="ml-2 hidden items-center gap-0.5 sm:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={btnQuiet}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/mypage"
                className="flex max-w-[8.5rem] items-center gap-1 truncate rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-bold whitespace-nowrap text-ink transition hover:bg-surface-soft"
              >
                <span aria-hidden>{emoji}</span>
                <span className="truncate">{nickname}</span>
              </Link>
              <form action={signOutAction} className="hidden sm:block">
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap text-ink-faint transition hover:bg-surface-soft hover:text-ink"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={btnQuiet}>
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-bold whitespace-nowrap text-on-brand shadow-[0_2px_0_0_var(--brand-strong)] transition active:translate-y-[2px] active:shadow-none"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
