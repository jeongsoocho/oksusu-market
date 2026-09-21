'use client'

import { useFormStatus } from 'react-dom'

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  autoComplete?: string
  hint?: string
  required?: boolean
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
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-cob-700">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-2xl border-2 border-corn-200 bg-white/90 px-4 py-3 text-cob-900 outline-none transition placeholder:text-cob-500/50 focus:border-corn-400 focus:ring-4 focus:ring-corn-200/60"
      />
      {hint ? <span className="mt-1.5 block text-xs text-cob-500">{hint}</span> : null}
    </label>
  )
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-corn-400 px-4 py-3.5 text-lg font-bold text-cob-900 shadow-[0_4px_0_0_var(--color-corn-600)] transition active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--color-corn-600)] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0"
    >
      {pending ? '잠시만요… 🌽' : children}
    </button>
  )
}

export function Alert({ tone, children }: { tone: 'error' | 'notice'; children: React.ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-husk-300 bg-husk-100 text-husk-700'
  return (
    <p role="status" className={`animate-pop-in rounded-2xl border-2 px-4 py-3 text-sm font-medium ${styles}`}>
      {tone === 'error' ? '⚠️ ' : '💌 '}
      {children}
    </p>
  )
}
