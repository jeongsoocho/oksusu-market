import type { Metadata } from 'next'
import { Jua } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const jua = Jua({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jua',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '옥수수마켓 🌽 — 우리 동네 중고거래',
  description: '알맹이처럼 촘촘한 우리 동네 중고거래, 옥수수마켓',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={jua.variable}>
      <body className="antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl px-4 py-10">{children}</main>
        <footer className="pb-10 text-center text-xs text-cob-500">
          🌽 옥수수마켓 · 개발 공부용 프로젝트
        </footer>
      </body>
    </html>
  )
}
