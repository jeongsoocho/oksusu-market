import { card, pageTitle } from '@/lib/styles'
import type { Metadata } from 'next'
import { CornMascot } from '@/components/corn-mascot'
import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = { title: '회원가입' }

export default function SignupPage() {
  return (
    <div className="animate-pop-in mx-auto max-w-md">
      <div className="flex flex-col items-center">
        <CornMascot size={96} wiggle />
        <h1 className="font-display mt-4 text-3xl text-ink">옥수수밭에 오신 걸 환영해요</h1>
        <p className="mt-1 text-sm text-ink-soft">30초면 알맹이가 될 수 있어요</p>
      </div>

      <div className={`${card} mt-7 p-6`}>
        <SignupForm />
      </div>
    </div>
  )
}
