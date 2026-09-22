import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { categoryOf, formatPrice, timeAgo } from '@/lib/products'
import { productImageUrl } from '@/lib/storage'
import { EmptyState } from '@/components/empty-state'
import { card, pageTitle } from '@/lib/styles'

export const metadata: Metadata = { title: '채팅' }

type Room = {
  id: number
  buyer_id: string
  seller_id: string
  last_message_at: string
  products: {
    id: number
    title: string
    price: number
    category: string
    images: string[]
  } | null
  buyer: { nickname: string; avatar_emoji: string } | null
  seller: { nickname: string; avatar_emoji: string } | null
}

export default async function ChatListPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/chat')

  const { data } = await supabase
    .from('chat_rooms')
    .select(
      `id, buyer_id, seller_id, last_message_at,
       products(id, title, price, category, images),
       buyer:profiles!chat_rooms_buyer_id_fkey(nickname, avatar_emoji),
       seller:profiles!chat_rooms_seller_id_fkey(nickname, avatar_emoji)`,
    )
    .order('last_message_at', { ascending: false })

  const rooms = (data ?? []) as unknown as Room[]

  // 방마다 마지막 메시지를 한 줄씩 붙여 줍니다.
  const lastMessages = new Map<number, string>()
  if (rooms.length > 0) {
    const { data: recent } = await supabase
      .from('chat_messages')
      .select('room_id, body, created_at')
      .in(
        'room_id',
        rooms.map((r) => r.id),
      )
      .order('created_at', { ascending: false })

    for (const message of recent ?? []) {
      if (!lastMessages.has(message.room_id)) {
        lastMessages.set(message.room_id, message.body)
      }
    }
  }

  return (
    <div className="animate-pop-in space-y-5">
      <h1 className={pageTitle}>💬 채팅</h1>

      {rooms.length === 0 ? (
        <EmptyState
          title="아직 나눈 이야기가 없어요"
          description="마음에 드는 물건에서 '채팅하기'를 눌러 말을 걸어 보세요."
          actionHref="/products"
          actionLabel="구경하러 가기"
        />
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => {
            const iAmBuyer = room.buyer_id === user.id
            const other = iAmBuyer ? room.seller : room.buyer
            const product = room.products
            const cover = product?.images?.[0]

            return (
              <li key={room.id}>
                <Link
                  href={`/chat/${room.id}`}
                  className={`${card} flex items-center gap-3 p-3 transition hover:border-brand`}
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-soft">
                    {cover ? (
                      <Image src={productImageUrl(cover)} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-2xl" aria-hidden>
                        {categoryOf(product?.category ?? 'etc').emoji}
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-bold text-ink">
                        {other?.avatar_emoji ?? '🌽'} {other?.nickname ?? '알 수 없음'}
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">
                        {iAmBuyer ? '구매' : '판매'}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-ink-faint">
                        {timeAgo(room.last_message_at)}
                      </span>
                    </span>

                    <span className="mt-0.5 block truncate text-sm text-ink-soft">
                      {lastMessages.get(room.id) ?? '아직 메시지가 없어요'}
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-ink-faint">
                      {product ? `${product.title} · ${formatPrice(product.price)}` : '지워진 글'}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
