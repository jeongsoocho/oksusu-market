'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signInAction } from '@/app/auth/actions'
import { initialAuthState } from '@/lib/auth-types'
import { Alert, Field, SubmitButton } from '@/components/ui'

export function LoginForm({ next = '/' }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, initialAuthState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <Field
        label="이메일"
        name="email"
        type="email"
        placeholder="corn@example.com"
        autoComplete="email"
        defaultValue={state.values?.email}
      />
      <Field
        label="비밀번호"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <SubmitButton>로그인</SubmitButton>

      <p className="pt-2 text-center text-sm text-cob-700">
        아직 옥수수밭에 안 들어왔나요?{' '}
        <Link href="/signup" className="font-bold text-husk-600 underline decoration-husk-300 decoration-2 underline-offset-4">
          회원가입
        </Link>
      </p>
    </form>
  )
}
