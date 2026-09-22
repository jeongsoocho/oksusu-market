import Link from 'next/link'
import { CornMascot } from '@/components/corn-mascot'
import { btnPrimary, cardDashed } from '@/lib/styles'

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
    <div className={`${cardDashed} flex flex-col items-center px-6 py-14 text-center`}>
      <CornMascot size={90} wiggle />
      <p className="mt-4 font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={`${btnPrimary} mt-5`}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
