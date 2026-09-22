'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { updateProfileAction } from '@/app/mypage/actions'
import { AVATAR_CHOICES, initialProfileState } from '@/lib/profile'
import { Alert, Field, SubmitButton } from '@/components/ui'
import { btnGhost, label as labelClass } from '@/lib/styles'

export function ProfileForm({
  nickname,
  avatarEmoji,
  region,
}: {
  nickname: string
  avatarEmoji: string
  region: string
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialProfileState)
  const v = state.values

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <fieldset>
        <legend className={labelClass}>내 그림</legend>
        <div className="flex flex-wrap gap-2">
          {AVATAR_CHOICES.map((emoji) => (
            <label key={emoji} className="cursor-pointer">
              <input
                type="radio"
                name="avatar_emoji"
                value={emoji}
                defaultChecked={(v?.avatar_emoji ?? avatarEmoji) === emoji}
                className="peer sr-only"
              />
              <span className="flex size-11 items-center justify-center rounded-2xl border border-line bg-surface text-xl transition peer-checked:border-brand-strong peer-checked:bg-brand-soft peer-focus-visible:ring-4 peer-focus-visible:ring-brand/30">
                {emoji}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="닉네임"
        name="nickname"
        defaultValue={v?.nickname ?? nickname}
        maxLength={20}
        hint="2~20자 · 한글, 영문, 숫자, 밑줄(_)"
      />

      <Field
        label="우리 동네"
        name="region"
        defaultValue={v?.region ?? region}
        maxLength={30}
        placeholder="옥수수동"
      />

      <div className="flex gap-3 pt-1">
        <Link href="/mypage" className={`${btnGhost} whitespace-nowrap`}>
          취소
        </Link>
        <div className="flex-1">
          <SubmitButton pendingLabel="저장 중… 🌽">저장</SubmitButton>
        </div>
      </div>
    </form>
  )
}
