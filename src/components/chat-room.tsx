'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessageAction } from '@/app/chat/actions'
import { input } from '@/lib/styles'

export type ChatMessage = {
  id: number
  sender_id: string
  body: string
  created_at: string
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export function ChatRoom({
  roomId,
  meId,
  otherName,
  otherEmoji,
  initialMessages,
  supabaseUrl,
  supabaseKey,
}: {
  roomId: number
  meId: string
  otherName: string
  otherEmoji: string
  initialMessages: ChatMessage[]
  supabaseUrl: string
  supabaseKey: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [, startTransition] = useTransition()

  const bottomRef = useRef<HTMLDivElement>(null)

  // 새 메시지가 오면 맨 아래로 내려 줍니다.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  // 상대가 보낸 메시지를 실시간으로 받아옵니다.
  useEffect(() => {
    const supabase = createClient(supabaseUrl, supabaseKey)
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    async function connect() {
      // ⚠️ 실시간 연결에도 로그인 정보를 따로 실어 줘야 합니다.
      // 이게 없으면 서버가 "모르는 사람"으로 보고 내 방 메시지를 안 보내 줍니다.
      const { data } = await supabase.auth.getSession()
      if (cancelled) return
      await supabase.realtime.setAuth(data.session?.access_token ?? null)
      if (cancelled) return

      channel = supabase
        .channel(`chat-room-${roomId}`)
        .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            // 내가 보낸 말은 이미 임시 말풍선으로 떠 있으므로 그 자리를 채웁니다.
            const withoutTemp = prev.filter(
              (m) => !(m.id < 0 && m.sender_id === row.sender_id && m.body === row.body),
            )
            return [...withoutTemp, row]
          })
        },
      )
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    }

    void connect()

    return () => {
      cancelled = true
      setLive(false)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [roomId, supabaseUrl, supabaseKey])

  function send() {
    const text = draft.trim()
    if (!text) return

    setDraft('')
    setError(null)

    // 내가 보낸 건 먼저 화면에 띄우고, 저장은 뒤따라갑니다.
    const tempId = -Date.now()
    const optimistic: ChatMessage = {
      id: tempId,
      sender_id: meId,
      body: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    startTransition(async () => {
      const result = await sendMessageAction(roomId, text)

      if (result.error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setDraft(text)
        setError(result.error)
        return
      }

      // 임시 말풍선을 저장된 진짜 메시지로 바꿔 둡니다.
      // (실시간 알림이 먼저 도착했다면 이미 들어와 있으니 임시본만 뺍니다)
      const saved = result.message
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId)
        if (!saved) return withoutTemp
        return withoutTemp.some((m) => m.id === saved.id)
          ? withoutTemp
          : [...withoutTemp, saved]
      })
    })
  }

  let lastDay = ''

  return (
    <div className="flex h-[65dvh] min-h-96 flex-col rounded-3xl border border-line bg-surface shadow-soft">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-full border border-line bg-surface-soft text-lg">
          {otherEmoji}
        </span>
        <p className="min-w-0 flex-1 truncate font-bold text-ink">{otherName}</p>
        <span
          title={live ? '실시간 연결됨' : '연결 중'}
          className={`size-2 rounded-full ${live ? 'bg-accent' : 'bg-ink-faint'}`}
        />
      </div>

      <ol className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <li className="py-10 text-center text-sm text-ink-faint">
            첫 마디를 건네 보세요 🌽
          </li>
        ) : null}

        {messages.map((message) => {
          const mine = message.sender_id === meId
          const day = dayLabel(message.created_at)
          const showDay = day !== lastDay
          lastDay = day

          return (
            <li key={message.id}>
              {showDay ? (
                <p className="my-3 text-center text-xs font-bold text-ink-faint">{day}</p>
              ) : null}

              <div
                className={`animate-message flex items-end gap-1.5 ${
                  mine ? 'justify-end' : 'justify-start'
                }`}
              >
                {mine ? (
                  <span className="text-[10px] text-ink-faint">
                    {timeLabel(message.created_at)}
                  </span>
                ) : null}

                <p
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                    mine
                      ? 'rounded-br-md bg-brand text-on-brand'
                      : 'rounded-bl-md bg-surface-soft text-ink'
                  }`}
                >
                  {message.body}
                </p>

                {!mine ? (
                  <span className="text-[10px] text-ink-faint">
                    {timeLabel(message.created_at)}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
        <div ref={bottomRef} />
      </ol>

      {error ? (
        <p className="px-4 pb-1 text-xs font-bold text-danger">⚠️ {error}</p>
      ) : null}

      <div className="flex items-end gap-2 border-t border-line p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter 로 보내고, Shift+Enter 는 줄바꿈
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="메시지를 입력하세요"
          className={`${input} max-h-32 flex-1 resize-none py-2.5`}
        />
        <button
          type="button"
          onClick={send}
          disabled={draft.trim().length === 0}
          className="shrink-0 rounded-2xl bg-brand px-4 py-2.5 font-bold text-on-brand shadow-[0_3px_0_0_var(--brand-strong)] transition active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"
        >
          보내기
        </button>
      </div>
    </div>
  )
}
