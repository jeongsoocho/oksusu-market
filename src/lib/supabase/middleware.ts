import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** 로그인해야만 볼 수 있는 경로 */
const PROTECTED = [
  /^\/mypage/,
  /^\/products\/new/,
  /^\/products\/[^/]+\/edit/,
]
/** 이미 로그인했다면 들어갈 필요가 없는 경로 */
const GUEST_ONLY = [/^\/login/, /^\/signup/]

/**
 * 만료가 다가온 액세스 토큰을 갱신하고, 새 쿠키를 요청과 응답 양쪽에 심어줍니다.
 * 이 과정이 없으면 서버 컴포넌트가 로그아웃된 것처럼 보일 수 있습니다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // getUser() 를 반드시 호출해야 토큰이 갱신됩니다. 사이에 다른 코드를 넣지 마세요.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && PROTECTED.some((pattern) => pattern.test(pathname))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && GUEST_ONLY.some((pattern) => pattern.test(pathname))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
