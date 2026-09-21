import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 클라이언트.
 *
 * ⚠️ 아직 어디서도 쓰지 않습니다. 지금 화면은 전부 서버에서 데이터를 읽어옵니다.
 *
 * 브라우저 코드에는 이름이 `NEXT_PUBLIC_` 으로 시작하는 환경 변수만 전달됩니다.
 * 지금 Vercel 에는 `SUPABASE_` 로 시작하는 이름만 넣어 두었기 때문에,
 * 이 파일을 실제로 쓰게 되는 날(예: 5단계 실시간 채팅)에는
 * `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 도 같이 넣어야 합니다.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      '브라우저용 Supabase 연결에는 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다. ' +
        '(SUPABASE_ 로 시작하는 이름은 서버에서만 읽을 수 있습니다)',
    )
  }

  return createBrowserClient(url, key)
}
