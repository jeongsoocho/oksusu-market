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

### 4단계 · 찜

| 기능 | 경로 |
| --- | --- |
| 찜하기 / 빼기 | 상세 페이지의 하트 |
| 찜한 물건 모아보기 | `/favorites` |

- 하트를 누르면 **즉시** 색이 차고 숫자가 오릅니다. 저장은 뒤따라가고, 실패하면 되돌립니다.
- 누가 무엇을 찜했는지는 **본인만** 볼 수 있습니다. 목록에 보이는 개수는 `products.favorite_count` 를 DB 트리거가 따로 세어 둔 값이라, 남의 찜 목록이 새지 않습니다.

### 5단계 · 채팅 (실시간)

| 기능 | 경로 |
| --- | --- |
| 채팅 시작 | 상세 페이지의 `💬 판매자와 채팅하기` |
| 채팅 목록 | `/chat` |
| 채팅방 | `/chat/[roomId]` |

- 채팅방은 **(상품 × 사는 사람)** 하나씩 생깁니다. 같은 물건에 다시 말을 걸면 기존 방으로 들어갑니다.
- 내 물건에는 내가 말을 걸 수 없습니다.
- 상대 메시지는 **새로고침 없이** 도착합니다 (Supabase Realtime).
- 내가 쓴 말은 먼저 화면에 뜨고 저장이 뒤따라갑니다. Enter 로 보내고 Shift+Enter 로 줄바꿈합니다.

> 실시간 연결에는 로그인 정보를 따로 실어 줘야 합니다([src/components/chat-room.tsx](src/components/chat-room.tsx) 의 `realtime.setAuth`).
> 이걸 빠뜨리면 연결은 되는데 **메시지가 하나도 안 옵니다.** 서버가 "모르는 사람"으로 보고 RLS 로 걸러내기 때문입니다.

### 그 밖에

- **다크 모드** — 헤더의 ☀️/🌙 버튼. 처음에는 기기 설정을 따르고, 한 번 고르면 기억합니다.
- **폰 하단 탭바** — 홈 · 거래 글 · 글쓰기 · 채팅 · 내 정보
- **프로필 수정** (`/mypage/edit`) — 그림 · 닉네임 · 동네
- **조회수** — 상세 페이지를 열면 오릅니다. 내 글을 내가 볼 때는 안 오릅니다.
- **공유하기** — 폰에서는 카카오톡 등 공유창, 안 되면 주소 복사
- **목록 정렬·필터** — 최신순 / 싼 순 / 인기순, 판매완료 숨기기, 제목+설명 검색
- **탭 아이콘** — 옥수수 마스코트 ([src/app/icon.svg](src/app/icon.svg))

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
- 실시간 채팅은 브라우저가 Supabase 에 직접 연결해야 하는데, **서버 화면이 주소와 열쇠를 부품에 내려주는 방식**으로 풀었습니다. 그래서 `NEXT_PUBLIC_` 이름을 따로 넣지 않아도 됩니다. ([src/app/chat/[roomId]/page.tsx](src/app/chat/[roomId]/page.tsx) 참고)

## 데이터베이스

가계부와 같은 Supabase 프로젝트를 쓰지만 테이블은 서로 다릅니다.

- 가계부 → `public.entries` (**건드리지 않습니다**)
- 옥수수마켓 → `public.profiles`, `public.products`, `public.favorites`, `public.chat_rooms`, `public.chat_messages`

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
  images      text[] not null default '{}',   -- Storage 안의 파일 경로 (최대 5장)
  favorite_count integer not null default 0,  -- 트리거가 세어 줍니다
  view_count     integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.favorites (
  user_id    uuid   not null references public.profiles (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.chat_rooms (
  id              bigint generated always as identity primary key,
  product_id      bigint not null references public.products (id) on delete cascade,
  buyer_id        uuid   not null references public.profiles (id) on delete cascade,
  seller_id       uuid   not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  unique (product_id, buyer_id)        -- 같은 물건 × 같은 사람 = 방 하나
);

create table public.chat_messages (
  id         bigint generated always as identity primary key,
  room_id    bigint not null references public.chat_rooms (id) on delete cascade,
  sender_id  uuid   not null references public.profiles (id) on delete cascade,
  body       text   not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
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
- `favorites` 는 본인 것만 보입니다. `chat_rooms` · `chat_messages` 는 그 방의 두 사람에게만 보입니다.

> ⚠️ 겪은 함정: `favorites` 테이블이 생기자 `products` 와 `profiles` 를 잇는 길이 두 개(파는 사람 / 찜한 사람)가 되어,
> `products?select=*,profiles(...)` 가 "어느 쪽이냐"며 오류를 냈습니다. 그래서 `profiles!products_seller_id_fkey(...)` 처럼
> 관계 이름을 콕 집어 줍니다. 테이블을 새로 만든 뒤 멀쩡하던 조회가 깨지면 이걸 의심해 보세요.

> 가계부(`entries`)는 로그인 없이 `anon` 키로 열려 있는 상태 그대로입니다. 옥수수마켓 회원가입이 가계부 동작을 바꾸지 않습니다.

## 코드 지도

```
src/
├─ middleware.ts              모든 요청에서 세션 갱신 + 접근 제어
├─ lib/
│  ├─ styles.ts                 버튼·카드·칩 모양 (여기만 고치면 앱 전체가 바뀜)
│  ├─ storage.ts                사진 경로·주소
│  ├─ profile.ts                프로필 그림 목록
│  ├─ supabase/client.ts        브라우저용 (주소·열쇠를 서버에서 받아옵니다)
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
│  ├─ products/[id]/edit/...    수정
│  ├─ products/favorite-actions.ts  찜 켜기/끄기
│  ├─ favorites/page.tsx        찜한 물건
│  ├─ chat/actions.ts           채팅방 만들기 / 메시지 보내기
│  ├─ chat/page.tsx             채팅 목록
│  ├─ chat/[roomId]/page.tsx    채팅방
│  ├─ mypage/edit/page.tsx      프로필 수정
│  ├─ globals.css               색·다크모드·애니메이션 (색은 여기 두 곳만 고치면 됨)
│  └─ icon.svg                  브라우저 탭 아이콘
└─ components/                  마스코트 · 헤더 · 하단탭 · 폼 · 카드 · 채팅 · 공통 UI
```

## 디자인 규칙

색을 직접 적지 말고 **이름**으로 씁니다. `bg-white` ❌ → `bg-surface` ✅

| 이름 | 쓰임 |
| --- | --- |
| `page` / `surface` / `surface-soft` | 배경 · 카드 · 옅은 칸 |
| `ink` / `ink-soft` / `ink-faint` | 진한 글씨 · 보통 · 흐린 글씨 |
| `line` / `line-soft` | 테두리 |
| `brand` / `brand-strong` / `brand-soft` | 옥수수 노랑 |
| `accent` / `accent-strong` / `accent-soft` | 껍질 초록 |
| `danger` / `heart` | 경고 · 찜 하트 |

[src/app/globals.css](src/app/globals.css) 의 `:root`(밝은 화면)와 `[data-theme="dark"]`(어두운 화면) 두 군데만 고치면 앱 전체 색이 바뀝니다.
버튼·카드처럼 반복되는 모양은 [src/lib/styles.ts](src/lib/styles.ts) 에 모여 있습니다.

## 다음 단계

1. ~~회원가입 / 로그인 / 로그아웃~~ ✅
2. ~~거래 글 쓰기 · 보기 · 수정 · 삭제~~ ✅
3. ~~상품 사진 올리기 (Supabase Storage)~~ ✅
4. ~~배포~~ ✅ https://oksusu-market.vercel.app
5. ~~찜 목록~~ ✅
6. ~~판매자와 채팅 (Realtime)~~ ✅
7. 안 읽은 메시지 표시 · 알림
8. 거래 후기 · 매너 온도
9. 동네 설정 (내 동네 주변 글만 보기)

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
- 보안 점검(advisor)에 `increment_product_view` 가 "누구나 호출 가능" 으로 뜨는 것은 **일부러 그렇게 둔 것**입니다. 로그인하지 않은 방문자도 조회수를 올릴 수 있어야 해서요. 다만 조회수를 억지로 부풀릴 수는 있으니, 중요한 숫자로 쓰지 마세요.
