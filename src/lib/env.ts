/**
 * 환경 변수를 읽는 자리를 한 곳으로 모았습니다.
 *
 * Vercel 쪽 이름을 `SUPABASE_` 로 시작하게 바꿨기 때문에, 예전 `NEXT_PUBLIC_` 이름도
 * 같이 받아 줍니다. 둘 중 아무거나 있으면 동작합니다.
 *
 * ⚠️ 주의 — `process.env.이름` 은 빌드할 때 글자 그대로 값으로 치환됩니다.
 * 그래서 `process.env[변수]` 처럼 동적으로 읽으면 빈 값이 됩니다.
 * 반드시 아래처럼 이름을 하나하나 적어 두어야 합니다.
 */

function required(label: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `환경 변수 ${label} 이(가) 비어 있습니다. ` +
        `내 PC 라면 .env.local 에, Vercel 이라면 Settings → Environment Variables 에 넣고 다시 배포(Redeploy)하세요.`,
    )
  }
  return value
}

/** Supabase 프로젝트 주소 */
export function supabaseUrl() {
  return required(
    'SUPABASE_URL',
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  )
}

/** 공개용(publishable) 열쇠. service_role 열쇠는 절대 여기 넣지 마세요. */
export function supabaseAnonKey() {
  return required(
    'SUPABASE_ANON_KEY',
    process.env.SUPABASE_ANON_KEY ??
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/**
 * 이메일 확인 링크가 돌아올 우리 사이트 주소.
 * 값을 안 넣어도 Vercel 이 자동으로 알려 주는 주소를 쓰도록 해 두었습니다.
 */
export function siteUrl() {
  const explicit =
    process.env.SUPABASE_SITE_URL ??
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL

  if (explicit) return explicit.replace(/\/+$/, '')

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return 'http://localhost:3000'
}
