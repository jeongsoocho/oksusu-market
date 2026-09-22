import { card, pageTitle } from '@/lib/styles'
import type { Metadata } from 'next'
import { CornMascot } from '@/components/corn-mascot'
import { LoginForm } from '@/components/login-form'
import { Alert } from '@/components/ui'

export const metadata: Metadata = { title: '로그인' }

const LINK_ERRORS: Record<string, string> = {
  missing_code: '링크가 온전하지 않아요. 메일의 링크를 다시 눌러 주세요.',
  missing_token: '링크가 온전하지 않아요. 메일의 링크를 다시 눌러 주세요.',
  invalid_link: '링크가 만료되었거나 이미 사용되었어요. 다시 로그인해 주세요.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <div className="animate-pop-in mx-auto max-w-md">
      <div className="flex flex-col items-center">
        <CornMascot size={96} wiggle />
        <h1 className="font-display mt-4 text-3xl text-ink">다시 만나서 반가워요</h1>
        <p className="mt-1 text-sm text-ink-soft">옥수수마켓에 로그인하세요</p>
      </div>

      <div className={`${card} mt-7 space-y-4 p-6`}>
        {error && LINK_ERRORS[error] ? <Alert tone="error">{LINK_ERRORS[error]}</Alert> : null}
        <LoginForm next={next ?? '/'} />
      </div>
    </div>
  )
}
