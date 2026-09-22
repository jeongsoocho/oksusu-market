import type { Metadata, Viewport } from 'next'
import { Jua } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import { BottomNav } from '@/components/bottom-nav'
import './globals.css'

const jua = Jua({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jua',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '옥수수마켓 🌽 — 우리 동네 중고거래',
    template: '%s · 옥수수마켓 🌽',
  },
  description: '알맹이처럼 촘촘한 우리 동네 중고거래, 옥수수마켓',
  applicationName: '옥수수마켓',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffaf0' },
    { media: '(prefers-color-scheme: dark)', color: '#1b140d' },
  ],
}

/**
 * 화면이 그려지기 전에 저장해 둔 밝기 설정을 먼저 적용합니다.
 * 이게 없으면 어두운 모드인데도 하얀 화면이 한 번 번쩍입니다.
 */
const themeScript = `
try {
  var saved = localStorage.getItem('oksusu-theme');
  if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
} catch (e) {}
`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={jua.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <SiteHeader />

        <main className="mx-auto w-full max-w-4xl px-4 py-8 pb-28 sm:pb-12">{children}</main>

        <footer className="pb-24 text-center text-xs text-ink-faint sm:pb-10">
          🌽 옥수수마켓 · 개발 공부용 프로젝트
        </footer>

        <BottomNav />
      </body>
    </html>
  )
}
