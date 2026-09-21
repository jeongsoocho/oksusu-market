'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUpAction } from '@/app/auth/actions'
import { initialAuthState } from '@/lib/auth-types'
import { Alert, Field, SubmitButton } from '@/components/ui'

export function SignupForm() {
  const [state, formAction] = useActionState(signUpAction, initialAuthState)

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.notice ? <Alert tone="notice">{state.notice}</Alert> : null}

      <Field
        label="닉네임"
        name="nickname"
        placeholder="옥수수러버"
        autoComplete="nickname"
        hint="2~20자 · 한글, 영문, 숫자, 밑줄(_)"
        defaultValue={state.values?.nickname}
      />
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
        autoComplete="new-password"
        hint="8자 이상 · 영문과 숫자를 섞어 주세요"
      />
      <Field
        label="비밀번호 확인"
        name="passwordConfirm"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
      />

      <SubmitButton>가입하고 옥수수 받기</SubmitButton>

      <p className="pt-2 text-center text-sm text-cob-700">
        이미 알맹이인가요?{' '}
        <Link href="/login" className="font-bold text-husk-600 underline decoration-husk-300 decoration-2 underline-offset-4">
          로그인
        </Link>
      </p>
    </form>
  )
}
