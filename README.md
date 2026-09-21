# 옥수수마켓 🌽

당근 대신 **옥수수**로 귀엽게 만든 우리 동네 중고거래 웹사이트. 개발 공부용으로 단계적으로 만들어 갑니다.

- **Next.js 15** (App Router, 서버 컴포넌트 + 서버 액션)
- **Supabase** (Auth + Postgres) — 가계부와 **같은 프로젝트**를 씁니다
- **Tailwind CSS v4** (`@theme` 로 옥수수 색 팔레트 정의)

## 지금까지 만든 것 (1단계 · 회원)

| 기능 | 경로 |
| --- | --- |
| 홈 | `/` |
| 회원가입 | `/signup` |
| 로그인 | `/login` |
| 내 정보 (로그인 필요) | `/mypage` |
| 로그아웃 | 헤더 · 내 정보 페이지의 버튼 |
| 이메일 확인 링크 처리 | `/auth/callback`, `/auth/confirm` |

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 열립니다.

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://edrzispsyektwgmueglb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` 은 git에 올라가지 않습니다. 배포할 때 호스팅 서비스의 환경 변수에 같은 값을 넣어 주세요.

## 데이터베이스

가계부와 같은 Supabase 프로젝트를 쓰지만 테이블은 서로 다릅니다.

- 가계부 → `public.entries`
- 옥수수마켓 → `public.profiles` (앞으로 `products`, `chats` 등이 추가될 예정)

```sql
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  nickname     text not null unique check (char_length(nickname) between 2 and 20),
  avatar_emoji text not null default '🌽',
  region       text not null default '옥수수동',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
```

- RLS 켜짐. 조회는 누구나(판매자 정보라서), 생성·수정은 `auth.uid() = id` 인 본인만.
- `auth.users` 에 행이 생기면 트리거 `on_auth_user_created` 가 프로필을 자동으로 만들어 줍니다. 닉네임이 겹치면 뒤에 숫자 4자리를 붙입니다.

> 가계부(`entries`)는 로그인 없이 `anon` 키로 열려 있는 상태 그대로입니다. 옥수수마켓 회원가입이 가계부 동작을 바꾸지 않습니다.

## 코드 지도

```
src/
├─ middleware.ts              모든 요청에서 세션 갱신 + 접근 제어
├─ lib/
│  ├─ supabase/client.ts      브라우저용 Supabase 클라이언트
│  ├─ supabase/server.ts      서버용 (쿠키 기반)
│  ├─ supabase/middleware.ts  토큰 갱신 + 보호/게스트 경로 판단
│  ├─ auth-types.ts           폼 상태 타입 ('use server' 파일은 함수만 export 가능)
│  └─ validation.ts           입력 검증 + 에러 메시지 한국어 변환
├─ app/
│  ├─ auth/actions.ts         signUp / signIn / signOut 서버 액션
│  ├─ auth/callback/route.ts  이메일 링크(?code=) → 세션 교환
│  └─ auth/confirm/route.ts   이메일 링크(?token_hash=) → verifyOtp
└─ components/                마스코트 · 헤더 · 폼 · 공통 UI
```

## 다음 단계

1. ~~회원가입 / 로그인 / 로그아웃~~ ✅
2. 상품 등록과 목록 (`products` 테이블 + Supabase Storage 이미지)
3. 상품 상세 · 관심(찜)
4. 판매자와 채팅 (Realtime)
5. 배포 (가계부와 다른 주소로)

## 배포할 때 잊지 말 것

- 호스팅 환경 변수에 `NEXT_PUBLIC_SITE_URL` 을 실제 도메인으로 설정
- Supabase 대시보드 → Authentication → URL Configuration 에
  - **Site URL**: 배포 주소
  - **Redirect URLs**: `https://<배포주소>/auth/callback`, `https://<배포주소>/auth/confirm`

## 개발하면서 알아 둘 것

- 이 Supabase 프로젝트는 **이메일 확인(Confirm email)이 꺼져 있습니다.** 그래서 가입하면 메일 확인 없이 바로 로그인됩니다. 켜고 싶다면 대시보드 → Authentication → Sign In / Providers → Email → *Confirm email* 을 켜세요. 켜면 가입 후 "확인 메일을 보냈어요" 안내가 뜨고, 메일 링크가 `/auth/callback` 으로 돌아옵니다.
- 동작 확인용 계정 두 개가 DB에 들어 있습니다. 필요 없으면 대시보드 → Authentication → Users 에서 지우세요.
  - `test-corn-01@example.com` / `corn1234` (닉네임 `테스트옥수수`)
  - `test-corn-02@example.com` / `corn1234` (닉네임 `테스트옥수수2`)
- Supabase 보안 점검(advisor)에서 **Leaked Password Protection** 이 꺼져 있다고 알려 줍니다. 대시보드 → Authentication → Password 에서 켜면 유출된 비밀번호를 막아 줍니다. (코드 수정 불필요)
- 트리거 전용 함수(`handle_new_user`, `touch_updated_at`)는 REST API 로 직접 호출되지 않도록 `EXECUTE` 권한을 회수해 두었습니다.
