'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AuthState } from '@/lib/auth-types'
import {
  translateAuthError,
  validateEmail,
  validateNickname,
  validatePassword,
} from '@/lib/validation'

/** 이메일 확인 링크가 돌아올 주소 */
async function siteOrigin() {
  const h = await headers()
  return (
    h.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  )
}

/** 안전한 내부 경로만 허용 (열린 리다이렉트 방지) */
function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === 'string' ? next : ''
  return value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('passwordConfirm') ?? '')
  const nickname = String(formData.get('nickname') ?? '').trim()
  const values = { email, nickname }

  const error =
    validateNickname(nickname) ??
    validateEmail(email) ??
    validatePassword(password) ??
    (password !== passwordConfirm ? '비밀번호가 서로 달라요.' : null)

  if (error) return { error, values }

  const supabase = await createClient()

  // 닉네임 중복은 가입 전에 먼저 알려 주는 편이 친절합니다.
  const { data: taken } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle()

  if (taken) {
    return { error: '이미 누가 쓰고 있는 닉네임이에요. 다른 이름은 어때요?', values }
  }

  const origin = await siteOrigin()
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${origin}/auth/callback?next=/mypage`,
    },
  })

  if (signUpError) {
    return { error: translateAuthError(signUpError.message), values }
  }

  // 이메일 확인이 켜져 있으면 세션 없이 돌아옵니다.
  if (!data.session) {
    return {
      notice: `${email} 으로 확인 메일을 보냈어요. 메일 속 링크를 누르면 가입이 끝나요! 🌽`,
      values,
    }
  }

  revalidatePath('/', 'layout')
  redirect('/mypage')
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const values = { email }

  const error = validateEmail(email) ?? (password ? null : '비밀번호를 입력해 주세요.')
  if (error) return { error, values }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: translateAuthError(signInError.message), values }
  }

  revalidatePath('/', 'layout')
  redirect(safeNext(formData.get('next')))
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
