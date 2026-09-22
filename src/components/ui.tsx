'use client'

import { useFormStatus } from 'react-dom'
import { btnPrimary, hint as hintClass, input, label as labelClass } from '@/lib/styles'

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  autoComplete?: string
  hint?: string
  required?: boolean
  maxLength?: number
}

export function Field({
  label,
  name,
  type = 'text',
  placeholder,
  defaultValue,
  autoComplete,
  hint,
  required = true,
  maxLength,
}: FieldProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        className={input}
      />
      {hint ? <span className={hintClass}>{hint}</span> : null}
    </label>
  )
}

export function SubmitButton({
  children,
  pendingLabel = '잠시만요… 🌽',
}: {
  children: React.ReactNode
  pendingLabel?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} w-full text-lg`}>
      {pending ? pendingLabel : children}
    </button>
  )
}

export function Alert({
  tone,
  children,
}: {
  tone: 'error' | 'notice'
  children: React.ReactNode
}) {
  const styles =
    tone === 'error'
      ? 'border-danger/40 bg-danger-soft text-danger'
      : 'border-accent/40 bg-accent-soft text-accent-strong'

  return (
    <p
      role="status"
      className={`animate-pop-in rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      {tone === 'error' ? '⚠️ ' : '💌 '}
      {children}
    </p>
  )
}
