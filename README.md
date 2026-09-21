# 옥수수마켓 🌽

당근 대신 **옥수수**로 귀엽게 만든 우리 동네 중고거래 웹사이트. 개발 공부용으로 단계적으로 만들어 갑니다.

- **Next.js 15** (App Router, 서버 컴포넌트 + 서버 액션)
- **Supabase** (Auth + Postgres) — 가계부와 **같은 프로젝트**를 씁니다
- **Tailwind CSS v4** (`@theme` 로 옥수수 색 팔레트 정의)

## 지금까지 만든 것

### 1단계 · 회원

| 기능 | 경로 |
| --- | --- |
| 홈 | `/` |
| 회원가입 | `/signup` |
| 로그인 | `/login` |
| 내 정보 (로그인 필요) | `/mypage` |
| 로그아웃 | 헤더 · 내 정보 페이지의 버튼 |
| 이메일 확인 링크 처리 | `/auth/callback`, `/auth/confirm` |

### 2단계 · 거래 글 CRUD

| 기능 | 경로 |
| --- | --- |
| 목록 · 검색 · 카테고리 필터 (사진 썸네일) | `/products`, `/products?q=찜기&category=kitchen` |
| 쓰기 (로그인 필요) | `/products/new` |
| 상세 | `/products/[id]` |
| 수정 (작성자만) | `/products/[id]/edit` |
| 삭제 (작성자만) | 상세 페이지의 🗑️ 버튼 — 한 번 확인 후 삭제 |
| 상태 바꾸기 | 상세 페이지에서 판매중 / 예약중 / 판매완료 |

- 카테고리 12개. 사진이 없는 글은 카테고리 이모지가 썸네일 자리를 대신합니다.
- 가격은 입력하면서 콤마가 찍히고, `💝 나눔(0원)` · `+1,000` 같은 빠른 버튼이 있습니다.
- 판매 상태 버튼은 누르는 즉시 칠해지고, 저장은 뒤따라갑니다(낙관적 갱신).
- 내 정보 페이지에 내가 올린 글과 판매중/판매완료 개수가 나옵니다.

### 3단계 · 상품 사진

- 한 글에 **최대 5장**. 첫 번째 사진이 목록 썸네일이 됩니다.
- 사진은 브라우저에서 **미리 줄여서** 올립니다 (긴 쪽 1280px, webp). 폰 사진 3MB 가 보통 200~400KB 로 줄어듭니다.
- 파일은 Supabase Storage 의 `product-images` 버킷에 `<user_id>/<uuid>.webp` 로 저장하고, `products.images` 에는 그 경로만 담습니다.
- 수정 화면에서 기존 사진을 빼거나 새로 더할 수 있습니다. **뺀 사진과 글을 지울 때의 사진은 보관함에서도 함께 지워집니다.**
- 상세 화면은 큰 사진 + 아래 썸네일로 넘겨 봅니다.

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 열립니다.

## 환경 변수 (`.env.local`)

```
SUPABASE_URL=https://edrzispsyektwgmueglb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SITE_URL=http://localhost:3000
```

`.env.local` 은 git에 올라가지 않습니다. 배포할 때 Vercel 의 Settings → Environment Variables 에 같은 이름·값을 넣고 **다시 배포(Redeploy)** 해야 반영됩니다.

읽는 자리는 [src/lib/env.ts](src/lib/env.ts) 한 곳으로 모아 두었습니다.

- 이름 앞에 `NEXT_PUBLIC_` 이 **없으면 서버에서만** 읽을 수 있습니다. 지금 화면은 전부 서버에서 데이터를 가져오기 때문에 문제없습니다.
- 예전 `NEXT_PUBLIC_...` 이름도 그대로 받아 줍니다. 둘 중 아무거나 있으면 동작합니다.
- `SUPABASE_SITE_URL` 을 안 넣으면 Vercel 이 자동으로 알려 주는 배포 주소를 씁니다.
- 값이 비어 있으면 `환경 변수 SUPABASE_URL 이(가) 비어 있습니다` 라고 로그에 찍힙니다. (예전에는 원인을 알 수 없는 500 에러만 떴습니다)
- 나중에 브라우저에서 Supabase 를 직접 부르게 되면(5단계 실시간 채팅 등) `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 도 같이 넣어야 합니다.

## 데이터베이스

가계부와 같은 Supabase 프로젝트를 쓰지만 테이블은 서로 다릅니다.

- 가계부 → `public.entries`
- 옥수수마켓 → `public.profiles`, `public.products` (앞으로 `chats` 등이 추가될 예정)

```sql
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  nickname     text not null unique check (char_length(nickname) between 2 and 20),
  avatar_emoji text not null default '🌽',
  region       text not null default '옥수수동',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.products (
  id          bigint generated always as identity primary key,
  seller_id   uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 2 and 60),
  price       integer not null check (price >= 0 and price <= 1000000000),
  category    text not null check (category in ('digital', 'appliance', ... , 'etc')),
  description text not null default '' check (char_length(description) <= 2000),
  region      text not null default '옥수수동',
  status      text not null default 'selling' check (status in ('selling', 'reserved', 'sold')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

사진은 Storage 버킷 `product-images` 에 들어갑니다 (공개 읽기, 5MB 제한, jpg/png/webp 만).

- 파일 경로는 항상 `<user_id>/<uuid>.<확장자>` 입니다. Storage 정책이 **맨 앞 폴더 이름이 내 아이디일 때만** 올리기·지우기를 허용합니다.
- `products.images` 는 그 경로들의 배열(최대 5개)입니다. 실제 주소는 [src/lib/storage.ts](src/lib/storage.ts) 의 `productImageUrl()` 이 만들어 줍니다.

- 두 테이블 모두 RLS 켜짐.
  - `profiles` — 조회는 누구나(판매자 정보라서), 생성·수정은 `auth.uid() = id` 인 본인만.
  - `products` — 조회는 누구나(로그인 없이도 구경 가능), 작성·수정·삭제는 `auth.uid() = seller_id` 인 작성자만.
- `auth.users` 에 행이 생기면 트리거 `on_auth_user_created` 가 프로필을 자동으로 만들어 줍니다. 닉네임이 겹치면 뒤에 숫자 4자리를 붙입니다.
- `products.seller_id` 는 일부러 `auth.users` 가 아니라 `public.profiles` 를 가리킵니다. 그래야 PostgREST 가 `products?select=*,profiles(nickname)` 처럼 판매자 정보를 한 번에 붙여 줍니다.
- 권한은 **세 겹**으로 막습니다: 미들웨어(경로) → 서버 액션의 `.eq('seller_id', user.id)` → DB 의 RLS. 어느 하나가 뚫려도 나머지가 막습니다.

> 가계부(`entries`)는 로그인 없이 `anon` 키로 열려 있는 상태 그대로입니다. 옥수수마켓 회원가입이 가계부 동작을 바꾸지 않습니다.

## 코드 지도

```
src/
├─ middleware.ts              모든 요청에서 세션 갱신 + 접근 제어
├─ lib/
│  ├─ supabase/client.ts        브라우저용 Supabase 클라이언트
│  ├─ supabase/server.ts        서버용 (쿠키 기반)
│  ├─ supabase/middleware.ts    토큰 갱신 + 보호/게스트 경로 판단
│  ├─ auth-types.ts             폼 상태 타입 ('use server' 파일은 함수만 export 가능)
│  ├─ product-form-state.ts     거래 글 폼 상태 타입 (같은 이유)
│  ├─ products.ts               카테고리·상태 상수, 가격/시간 표시, 검증
│  └─ validation.ts             회원 입력 검증 + 에러 메시지 한국어 변환
├─ app/
│  ├─ auth/actions.ts           signUp / signIn / signOut 서버 액션
│  ├─ auth/callback/route.ts    이메일 링크(?code=) → 세션 교환
│  ├─ auth/confirm/route.ts     이메일 링크(?token_hash=) → verifyOtp
│  ├─ products/actions.ts       create / update / updateStatus / delete 서버 액션
│  ├─ products/page.tsx         목록 · 검색 · 카테고리 필터
│  ├─ products/new/page.tsx     글 쓰기
│  ├─ products/[id]/page.tsx    상세 (작성자면 상태 변경·수정·삭제)
│  └─ products/[id]/edit/...    수정
└─ components/                  마스코트 · 헤더 · 폼 · 카드 · 공통 UI
```

## 다음 단계

1. ~~회원가입 / 로그인 / 로그아웃~~ ✅
2. ~~거래 글 쓰기 · 보기 · 수정 · 삭제~~ ✅
3. ~~상품 사진 올리기 (Supabase Storage)~~ ✅
4. ~~배포~~ ✅ https://oksusu-market.vercel.app
5. 관심(찜) 목록
6. 판매자와 채팅 (Realtime)

## 배포할 때 잊지 말 것

- 호스팅 환경 변수에 `NEXT_PUBLIC_SITE_URL` 을 실제 도메인으로 설정
- Supabase 대시보드 → Authentication → URL Configuration 에
  - **Site URL**: 배포 주소
  - **Redirect URLs**: `https://<배포주소>/auth/callback`, `https://<배포주소>/auth/confirm`

## 개발하면서 알아 둘 것

- 이 Supabase 프로젝트는 **이메일 확인(Confirm email)이 꺼져 있습니다.** 그래서 가입하면 메일 확인 없이 바로 로그인됩니다. 켜고 싶다면 대시보드 → Authentication → Sign In / Providers → Email → *Confirm email* 을 켜세요. 켜면 가입 후 "확인 메일을 보냈어요" 안내가 뜨고, 메일 링크가 `/auth/callback` 으로 돌아옵니다.
- 동작 확인용으로 만들었던 계정들은 모두 지웠습니다. 앞으로도 테스트 계정을 만들면 **확인이 끝난 뒤 지우고**, 비밀번호는 공개 저장소에 적지 않습니다.
- Supabase 보안 점검(advisor)에서 **Leaked Password Protection** 이 꺼져 있다고 알려 줍니다. 대시보드 → Authentication → Password 에서 켜면 유출된 비밀번호를 막아 줍니다. (코드 수정 불필요)
- 트리거 전용 함수(`handle_new_user`, `touch_updated_at`)는 REST API 로 직접 호출되지 않도록 `EXECUTE` 권한을 회수해 두었습니다.
- `npm run dev` 를 켜 둔 채로 `npm run build` 를 돌리면 둘 다 `.next` 폴더를 써서 dev 서버가 `Cannot find module './61.js'` 같은 에러를 냅니다. 그럴 땐 dev 서버를 끄고 `.next` 를 지운 뒤 다시 켜면 됩니다.
