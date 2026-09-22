'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type FavoriteResult = {
  favorited?: boolean
  error?: string
  needLogin?: boolean
}

/**
 * 찜 켜기/끄기.
 * 개수는 DB 트리거가 products.favorite_count 에 알아서 세어 줍니다.
 */
export async function toggleFavorite(
  productId: number,
  next: boolean,
): Promise<FavoriteResult> {
  if (!Number.isInteger(productId)) return { error: '잘못된 글이에요.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인하면 찜할 수 있어요.', needLogin: true }

  if (next) {
    // 이미 찜해 둔 상태에서 또 눌러도 오류가 나지 않게 무시합니다.
    const { error } = await supabase
      .from('favorites')
      .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' })
    if (error) return { error: `찜하지 못했어요: ${error.message}` }
  } else {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)
    if (error) return { error: `찜을 빼지 못했어요: ${error.message}` }
  }

  revalidatePath(`/products/${productId}`)
  revalidatePath('/favorites')
  return { favorited: next }
}
