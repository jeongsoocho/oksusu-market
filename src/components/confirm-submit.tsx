'use client'

/** 누르면 한 번 물어보는 제출 버튼 (삭제처럼 되돌릴 수 없는 동작에 사용) */
export function ConfirmSubmit({
  message,
  className,
  children,
}: {
  message: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
