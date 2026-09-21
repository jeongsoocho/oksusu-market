import Link from 'next/link'
import { CornMascot } from '@/components/corn-mascot'

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-corn-200 bg-white/50 px-6 py-14 text-center">
      <CornMascot size={90} wiggle />
      <p className="mt-4 font-bold text-cob-900">{title}</p>
      <p className="mt-1 text-sm text-cob-700">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 rounded-2xl bg-corn-400 px-5 py-2.5 font-bold text-cob-900 shadow-[0_3px_0_0_var(--color-corn-600)] transition active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-corn-600)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
