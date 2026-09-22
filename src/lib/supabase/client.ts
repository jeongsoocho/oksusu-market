import { createBrowserClient } from '@supabase/ssr'

/**
 * 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 연결.
 *
 * 주소와 열쇠를 **인자로 받습니다.** 브라우저에는 이름이 `NEXT_PUBLIC_` 으로 시작하는
 * 환경 변수만 전달되는데, 우리는 `SUPABASE_` 이름을 쓰고 있기 때문입니다.
 * 그래서 서버 화면이 값을 읽어 이 부품에 내려 주고, 여기서 연결을 만듭니다.
 *
 * 열쇠는 원래 공개용(publishable)이라 브라우저에 노출돼도 괜찮습니다.
 * 실제 데이터는 DB 의 RLS 규칙이 지킵니다.
 */
export function createClient(url: string, publishableKey: string) {
  return createBrowserClient(url, publishableKey)
}
