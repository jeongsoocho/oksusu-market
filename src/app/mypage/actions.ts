'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { validateNickname } from '@/lib/validation'
import { AVATAR_CHOICES, type ProfileState } from '@/lib/profile'

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const nickname = String(formData.get('nickname') ?? '').trim()
  const avatar = String(formData.get('avatar_emoji') ?? '🌽')
  const region = String(formData.get('region') ?? '').trim()
  const values = { nickname, avatar_emoji: avatar, region }

  const invalid =
    validateNickname(nickname) ??
    ((AVATAR_CHOICES as readonly string[]).includes(avatar)
      ? null
      : '고를 수 없는 그림이에요.') ??
    (region.length >= 1 && region.length <= 30 ? null : '동네는 1~30자로 적어 주세요.')

  if (invalid) return { error: invalid, values }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 풀렸어요. 다시 로그인해 주세요.', values }

  // 닉네임은 겹칠 수 없습니다. 내 것은 빼고 검사합니다.
  const { data: taken } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', nickname)
    .neq('id', user.id)
    .maybeSingle()

  if (taken) {
    return { error: '이미 누가 쓰고 있는 닉네임이에요. 다른 이름은 어때요?', values }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ nickname, avatar_emoji: avatar, region })
    .eq('id', user.id)

  if (error) return { error: `저장하지 못했어요: ${error.message}`, values }

  revalidatePath('/', 'layout')
  redirect('/mypage')
}
