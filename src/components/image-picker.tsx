'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export const MAX_IMAGES = 5

/** 이미 올라가 있는 사진 (수정 화면에서만 씁니다) */
export type ExistingImage = { path: string; url: string }

/**
 * 사진을 브라우저에서 미리 줄입니다.
 *
 * 요즘 폰 사진은 한 장에 5MB 가 넘기도 해서, 그대로 보내면 느리고 용량도 낭비입니다.
 * 긴 쪽을 1280px 로 줄이고 webp 로 바꾸면 보통 200~400KB 로 줄어듭니다.
 */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.82),
    )
    if (!blob) return file
    if (blob.size >= file.size) return file // 줄여도 안 작아지면 원본 그대로

    const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${name}.webp`, { type: 'image/webp' })
  } catch {
    // 브라우저가 못 읽는 형식이면 원본을 그대로 보냅니다 (서버가 걸러 줍니다)
    return file
  }
}

export function ImagePicker({ existing = [] }: { existing?: ExistingImage[] }) {
  const [kept, setKept] = useState<ExistingImage[]>(existing)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // 실제로 폼과 함께 서버로 보내지는 입력칸
  const inputRef = useRef<HTMLInputElement>(null)

  const total = kept.length + files.length
  const room = MAX_IMAGES - total

  // 고른 파일을 입력칸에 다시 심어 줍니다. (줄인 파일을 보내기 위해)
  useEffect(() => {
    if (!inputRef.current) return
    const dt = new DataTransfer()
    for (const file of files) dt.items.add(file)
    inputRef.current.files = dt.files
  }, [files])

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  async function onPick(picked: FileList | null) {
    if (!picked || picked.length === 0) return
    setNotice(null)
    setBusy(true)

    const incoming = Array.from(picked)
    const allowed = incoming.slice(0, room)
    if (incoming.length > room) {
      setNotice(`사진은 ${MAX_IMAGES}장까지예요. ${allowed.length}장만 담았어요.`)
    }

    const shrunk = await Promise.all(allowed.map(shrink))
    setFiles((prev) => [...prev, ...shrunk])
    setBusy(false)
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-cob-700">
        사진 <span className="font-normal text-cob-500">({total}/{MAX_IMAGES})</span>
      </span>

      {/* 남겨 둘 기존 사진의 경로를 서버로 함께 보냅니다 */}
      {kept.map((image) => (
        <input key={image.path} type="hidden" name="keepImages" value={image.path} />
      ))}

      {/* 화면에는 안 보이고, 줄인 파일만 담기는 진짜 입력칸 */}
      <input ref={inputRef} type="file" name="images" multiple className="hidden" />

      <div className="flex flex-wrap gap-2">
        {kept.map((image) => (
          <Thumb
            key={image.path}
            src={image.url}
            onRemove={() => setKept((prev) => prev.filter((i) => i.path !== image.path))}
          />
        ))}

        {previews.map((src, index) => (
          <Thumb
            key={src}
            src={src}
            badge="새 사진"
            onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
          />
        ))}

        {room > 0 ? (
          <label
            className={`flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-corn-300 bg-white/70 text-cob-700 transition hover:bg-corn-100 ${
              busy ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                void onPick(e.target.files)
                e.target.value = '' // 같은 사진을 다시 고를 수 있게 비워 둡니다
              }}
            />
            <span className="text-2xl">{busy ? '⏳' : '📷'}</span>
            <span className="text-xs font-bold">{busy ? '줄이는 중' : '사진 추가'}</span>
          </label>
        ) : null}
      </div>

      <p className="mt-1.5 text-xs text-cob-500">
        JPG · PNG · WEBP · 최대 {MAX_IMAGES}장 · 첫 번째 사진이 목록에 보여요
      </p>
      {notice ? <p className="mt-1 text-xs font-bold text-husk-600">{notice}</p> : null}
    </div>
  )
}

function Thumb({
  src,
  badge,
  onRemove,
}: {
  src: string
  badge?: string
  onRemove: () => void
}) {
  return (
    <div className="relative size-24 overflow-hidden rounded-2xl border-2 border-corn-200 bg-corn-100">
      {/* 미리보기라 next/image 대신 기본 img 를 씁니다 (blob: 주소도 써야 해서) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
      {badge ? (
        <span className="absolute bottom-0 left-0 rounded-tr-lg bg-husk-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label="이 사진 빼기"
        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-cob-900/70 text-sm font-bold text-white transition hover:bg-cob-900"
      >
        ✕
      </button>
    </div>
  )
}
