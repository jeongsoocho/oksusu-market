/** 프로필에서 고를 수 있는 그림과 폼 상태 타입 ('use server' 파일은 함수만 내보낼 수 있어서 여기 둡니다) */

export const AVATAR_CHOICES = [
  '🌽', '🥕', '🍅', '🥔', '🍠', '🧄', '🥬', '🌻',
  '🐥', '🐰', '🐻', '🐼', '🦊', '🐨', '🐸', '🐧',
] as const

export type ProfileState = {
  error?: string
  values?: { nickname?: string; avatar_emoji?: string; region?: string }
}

export const initialProfileState: ProfileState = {}
