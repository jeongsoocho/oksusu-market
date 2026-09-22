import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile-form'
import { card, pageTitle } from '@/lib/styles'

export const metadata: Metadata = { title: '프로필 수정' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/mypage/edit')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_emoji, region')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="animate-pop-in mx-auto max-w-md">
      <h1 className={pageTitle}>✏️ 프로필 수정</h1>
      <p className="mt-1 text-sm text-ink-soft">다른 사람에게 보이는 내 모습이에요</p>

      <div className={`${card} mt-6 p-6`}>
        <ProfileForm
          nickname={profile?.nickname ?? ''}
          avatarEmoji={profile?.avatar_emoji ?? '🌽'}
          region={profile?.region ?? '옥수수동'}
        />
      </div>
    </div>
  )
}
