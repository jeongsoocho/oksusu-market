import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'
import { cookies } from 'next/headers'

/**
 * 서버(서버 컴포넌트 / 서버 액션 / 라우트 핸들러)에서 쓰는 Supabase 클라이언트.
 * 세션이 쿠키에 담기기 때문에 요청마다 새로 만들어야 합니다.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // 서버 컴포넌트에서는 쿠키를 쓸 수 없습니다.
            // 미들웨어가 세션을 갱신해 주므로 여기서는 무시해도 됩니다.
          }
        },
      },
    },
  )
}
