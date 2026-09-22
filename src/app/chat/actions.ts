'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * 상품 상세에서 "채팅하기" 를 누르면 불립니다.
 * 이미 이 상품으로 판매자와 나눈 방이 있으면 그 방으로 보내고, 없으면 새로 만듭니다.
 */
export async function startChatAction(formData: FormData) {
  const productId = Number(formData.get('productId'))
  if (!Number.isInteger(productId)) redirect('/products')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/products/${productId}`)

  const { data: product } = await supabase
    .from('products')
    .select('id, seller_id')
    .eq('id', productId)
    .maybeSingle()

  if (!product) redirect('/products')
  // 내 물건에는 내가 말을 걸 수 없습니다.
  if (product.seller_id === user.id) redirect(`/products/${productId}`)

  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .maybeSingle()

  if (existing) redirect(`/chat/${existing.id}`)

  const { data: created, error } = await supabase
    .from('chat_rooms')
    .insert({ product_id: productId, buyer_id: user.id, seller_id: product.seller_id })
    .select('id')
    .single()

  if (error || !created) redirect(`/products/${productId}?chat=failed`)

  revalidatePath('/chat')
  redirect(`/chat/${created.id}`)
}

export type SavedMessage = {
  id: number
  sender_id: string
  body: string
  created_at: string
}

export type SendResult = { error?: string; message?: SavedMessage }

/**
 * 메시지 보내기.
 * 저장된 진짜 메시지를 돌려줍니다. 화면에 미리 띄워 둔 임시 말풍선을
 * 이걸로 바꿔치기해야 같은 말이 두 번 보이지 않습니다.
 */
export async function sendMessageAction(
  roomId: number,
  body: string,
): Promise<SendResult> {
  const text = body.trim()
  if (!Number.isInteger(roomId)) return { error: '잘못된 채팅방이에요.' }
  if (text.length === 0) return { error: '보낼 내용을 적어 주세요.' }
  if (text.length > 1000) return { error: '한 번에 1000자까지 보낼 수 있어요.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 풀렸어요. 다시 로그인해 주세요.' }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ room_id: roomId, sender_id: user.id, body: text })
    .select('id, sender_id, body, created_at')
    .single()

  if (error) return { error: `보내지 못했어요: ${error.message}` }

  revalidatePath('/chat')
  revalidatePath(`/chat/${roomId}`)
  return { message: data as SavedMessage }
}
