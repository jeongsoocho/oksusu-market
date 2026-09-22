import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAnonKey, supabaseUrl } from '@/lib/env'
import { categoryOf, formatPrice, statusOf } from '@/lib/products'
import { productImageUrl } from '@/lib/storage'
import { ChatRoom, type ChatMessage } from '@/components/chat-room'
import { card } from '@/lib/styles'

export const metadata: Metadata = { title: '채팅방' }

type Room = {
  id: number
  buyer_id: string
  seller_id: string
  products: {
    id: number
    title: string
    price: number
    status: string
    category: string
    images: string[]
  } | null
  buyer: { nickname: string; avatar_emoji: string } | null
  seller: { nickname: string; avatar_emoji: string } | null
}

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId: raw } = await params
  const roomId = Number(raw)
  if (!Number.isInteger(roomId) || roomId <= 0) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/chat/${roomId}`)

  // 내가 낀 방이 아니면 RLS 가 아예 안 보여 줍니다.
  const { data } = await supabase
    .from('chat_rooms')
    .select(
      `id, buyer_id, seller_id,
       products(id, title, price, status, category, images),
       buyer:profiles!chat_rooms_buyer_id_fkey(nickname, avatar_emoji),
       seller:profiles!chat_rooms_seller_id_fkey(nickname, avatar_emoji)`,
    )
    .eq('id', roomId)
    .maybeSingle()

  const room = (data as unknown as Room) ?? null
  if (!room) notFound()

  const { data: messageRows } = await supabase
    .from('chat_messages')
    .select('id, sender_id, body, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(200)

  const iAmBuyer = room.buyer_id === user.id
  const other = iAmBuyer ? room.seller : room.buyer
  const product = room.products
  const cover = product?.images?.[0]
  const status = statusOf(product?.status ?? 'selling')

  return (
    <div className="animate-pop-in space-y-4">
      <Link href="/chat" className="inline-block text-sm font-bold text-ink-soft hover:underline">
        ← 채팅 목록
      </Link>

      {product ? (
        <Link href={`/products/${product.id}`} className={`${card} flex items-center gap-3 p-3 transition hover:border-brand`}>
          <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-soft">
            {cover ? (
              <Image src={productImageUrl(cover)} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-xl" aria-hidden>
                {categoryOf(product.category).emoji}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-ink">{product.title}</span>
            <span className="text-sm text-ink-soft">{formatPrice(product.price)}</span>
          </span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${status.chip}`}>
            {status.label}
          </span>
        </Link>
      ) : (
        <p className={`${card} p-3 text-sm text-ink-faint`}>지워진 글이에요.</p>
      )}

      <ChatRoom
        roomId={roomId}
        meId={user.id}
        otherName={other?.nickname ?? '알 수 없는 옥수수'}
        otherEmoji={other?.avatar_emoji ?? '🌽'}
        initialMessages={(messageRows ?? []) as ChatMessage[]}
        supabaseUrl={supabaseUrl()}
        supabaseKey={supabaseAnonKey()}
      />
    </div>
  )
}
