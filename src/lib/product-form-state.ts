/**
 * 'use server' 파일은 함수만 내보낼 수 있어서 폼 상태 타입은 여기에 둡니다.
 * (1단계의 auth-types.ts 와 같은 이유)
 */
export type ProductFormState = {
  error?: string
  values?: {
    title?: string
    price?: string
    category?: string
    description?: string
    region?: string
  }
}

export const initialProductFormState: ProductFormState = {}
