/** 거래 글에서 공통으로 쓰는 상수 · 표시용 함수 · 검증 */

export const CATEGORIES = [
  { value: 'digital', label: '디지털기기', emoji: '📱' },
  { value: 'appliance', label: '생활가전', emoji: '🧺' },
  { value: 'furniture', label: '가구/인테리어', emoji: '🛋️' },
  { value: 'kitchen', label: '생활/주방', emoji: '🍳' },
  { value: 'clothes', label: '의류/잡화', emoji: '👕' },
  { value: 'beauty', label: '뷰티/미용', emoji: '💄' },
  { value: 'book', label: '도서/티켓', emoji: '📚' },
  { value: 'sports', label: '스포츠/레저', emoji: '⚽' },
  { value: 'hobby', label: '취미/게임', emoji: '🎮' },
  { value: 'pet', label: '반려동물', emoji: '🐾' },
  { value: 'plant', label: '식물/농작물', emoji: '🌽' },
  { value: 'etc', label: '기타', emoji: '📦' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as readonly string[]

export function categoryOf(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? { value, label: '기타', emoji: '📦' }
}

export const STATUSES = [
  { value: 'selling', label: '판매중', chip: 'bg-husk-500 text-white' },
  { value: 'reserved', label: '예약중', chip: 'bg-corn-500 text-cob-900' },
  { value: 'sold', label: '판매완료', chip: 'bg-cob-500/70 text-white' },
] as const

export type StatusValue = (typeof STATUSES)[number]['value']

export const STATUS_VALUES = STATUSES.map((s) => s.value) as readonly string[]

export function statusOf(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0]
}

/** DB 에서 읽어오는 거래 글 한 건 */
export type Product = {
  id: number
  seller_id: string
  title: string
  price: number
  category: string
  description: string
  region: string
  status: string
  images: string[]
  favorite_count: number
  view_count: number
  created_at: string
  updated_at: string
  profiles: { nickname: string; avatar_emoji: string } | null
}

/**
 * 조인해서 읽을 컬럼 목록.
 *
 * 판매자 정보를 가져올 때 관계 이름(products_seller_id_fkey)을 콕 집어 주는 이유:
 * favorites 테이블이 생기면서 products 와 profiles 를 잇는 길이 두 개가 되었습니다.
 * (파는 사람 / 찜한 사람) 그냥 profiles 라고만 쓰면 PostgREST 가 어느 쪽인지 몰라 오류를 냅니다.
 */
export const PRODUCT_SELECT =
  'id, seller_id, title, price, category, description, region, status, images, favorite_count, view_count, created_at, updated_at, profiles!products_seller_id_fkey(nickname, avatar_emoji)'

export function formatPrice(price: number) {
  return price === 0 ? '나눔 💝' : `${price.toLocaleString('ko-KR')}원`
}

/** "3분 전" 같은 상대 시간. 일주일이 넘으면 날짜로 보여줍니다. */
export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '방금 전'
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

/** 폼에서 온 값 검증. 문제가 없으면 null. */
export function validateProduct(input: {
  title: string
  price: string
  category: string
  description: string
  region: string
}): string | null {
  if (input.title.length < 2 || input.title.length > 60) {
    return '제목은 2~60자로 적어 주세요.'
  }
  if (!/^\d{1,10}$/.test(input.price)) {
    return '가격은 숫자만 넣어 주세요. 그냥 드릴 거면 0원으로요!'
  }
  if (Number(input.price) > 1_000_000_000) {
    return '가격이 너무 커요. 10억 원까지만 올릴 수 있어요.'
  }
  if (!CATEGORY_VALUES.includes(input.category)) {
    return '카테고리를 골라 주세요.'
  }
  if (input.description.length > 2000) {
    return '설명은 2000자까지 쓸 수 있어요.'
  }
  if (input.region.length < 1 || input.region.length > 30) {
    return '거래 지역은 1~30자로 적어 주세요.'
  }
  return null
}
