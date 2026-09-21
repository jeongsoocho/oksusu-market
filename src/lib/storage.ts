import { supabaseUrl } from '@/lib/env'

/**
 * 상품 사진 보관함(Storage) 관련 도우미.
 *
 * ⚠️ 이 파일은 **서버에서만** 씁니다. `supabaseUrl()` 이 읽는 환경 변수에는
 * `NEXT_PUBLIC_` 접두사가 없어서 브라우저에서는 값이 비어 있습니다.
 * 화면에 사진을 보여줄 때는 서버에서 주소를 완성해 내려보내세요.
 */

export const PRODUCT_BUCKET = 'product-images'

/** 한 글에 올릴 수 있는 사진 장수 */
export const MAX_IMAGES = 5

/** 사진 한 장의 최대 크기 (5MB) — 버킷 설정과 같은 값 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** DB 에 저장된 경로 → 브라우저가 열 수 있는 실제 주소 */
export function productImageUrl(path: string) {
  return `${supabaseUrl()}/storage/v1/object/public/${PRODUCT_BUCKET}/${path}`
}

export function productImageUrls(paths: string[] | null | undefined) {
  return (paths ?? []).map(productImageUrl)
}

/** 확장자 고르기. 모르는 형식이면 jpg 로 둡니다. */
function extensionOf(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * 저장할 파일 경로를 만듭니다. 맨 앞이 사용자 아이디여야
 * Storage 정책이 "내 폴더"로 인정해 줍니다.
 */
export function newImagePath(userId: string, type: string) {
  return `${userId}/${crypto.randomUUID()}.${extensionOf(type)}`
}

/** 이 경로가 정말 그 사람 폴더 안인지 확인 (남의 사진을 지우지 못하게) */
export function isOwnImagePath(path: string, userId: string) {
  return path.startsWith(`${userId}/`)
}
