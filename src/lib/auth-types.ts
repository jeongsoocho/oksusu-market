/**
 * 'use server' 파일은 함수만 내보낼 수 있어서,
 * 폼 상태 타입과 초기값은 여기에 따로 둡니다.
 */
export type AuthState = {
  error?: string
  notice?: string
  values?: { email?: string; nickname?: string }
}

export const initialAuthState: AuthState = {}
