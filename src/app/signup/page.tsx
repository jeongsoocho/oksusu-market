import type { Metadata } from 'next'
import { CornMascot } from '@/components/corn-mascot'
import { SignupForm } from '@/components/signup-form'

export const metadata: Metadata = { title: '회원가입 · 옥수수마켓 🌽' }

export default function SignupPage() {
  return (
    <div className="animate-pop-in mx-auto max-w-md">
      <div className="flex flex-col items-center">
        <CornMascot size={96} wiggle />
        <h1 className="font-display mt-4 text-3xl text-cob-900">옥수수밭에 오신 걸 환영해요</h1>
        <p className="mt-1 text-sm text-cob-700">30초면 알맹이가 될 수 있어요</p>
      </div>

      <div className="mt-7 rounded-3xl border-2 border-corn-200 bg-white/80 p-6 shadow-sm">
        <SignupForm />
      </div>
    </div>
  )
}
