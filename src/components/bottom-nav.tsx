'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: '홈', emoji: '🏠', exact: true },
  { href: '/products', label: '거래 글', emoji: '🛍️' },
  { href: '/products/new', label: '글쓰기', emoji: '✏️' },
  { href: '/chat', label: '채팅', emoji: '💬' },
  { href: '/mypage', label: '내 정보', emoji: '🌽' },
]

/** 폰에서만 보이는 아래쪽 탭바 */
export function BottomNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/90 backdrop-blur sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition ${
                  active ? 'text-ink' : 'text-ink-faint'
                }`}
              >
                <span className={`text-lg transition ${active ? 'scale-110' : ''}`}>
                  {tab.emoji}
                </span>
                {tab.label}
                {tab.href === '/chat' && unread > 0 ? (
                  <span className="absolute right-[22%] top-1 min-w-4 rounded-full bg-danger px-1 text-[10px] leading-4 text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand" />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
