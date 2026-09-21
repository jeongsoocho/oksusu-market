/** 폼 검증 — 서버 액션에서 재사용합니다. */

export function validateEmail(email: string): string | null {
  if (!email) return '이메일을 입력해 주세요.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return '이메일 형식이 올바르지 않아요.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return '비밀번호를 입력해 주세요.'
  if (password.length < 8) return '비밀번호는 8자 이상이어야 해요.'
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return '비밀번호에 영문과 숫자를 모두 넣어 주세요.'
  }
  return null
}

export function validateNickname(nickname: string): string | null {
  if (!nickname) return '닉네임을 입력해 주세요.'
  if (nickname.length < 2 || nickname.length > 20) return '닉네임은 2~20자로 지어 주세요.'
  if (!/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
    return '닉네임은 한글·영문·숫자·밑줄(_)만 쓸 수 있어요.'
  }
  return null
}

/** Supabase 가 돌려주는 영어 에러를 알아보기 쉬운 문장으로 바꿔 줍니다. */
export function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않아요.'
  if (m.includes('email not confirmed')) return '아직 이메일 인증이 끝나지 않았어요. 메일함을 확인해 주세요.'
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return '이미 가입된 이메일이에요. 로그인해 주세요.'
  }
  if (m.includes('password should be at least')) return '비밀번호가 너무 짧아요.'
  if (m.includes('rate limit') || m.includes('too many')) {
    return '요청이 너무 잦아요. 잠시 뒤에 다시 시도해 주세요.'
  }
  if (m.includes('signups not allowed')) return '지금은 회원가입이 막혀 있어요.'
  return `문제가 생겼어요: ${message}`
}
