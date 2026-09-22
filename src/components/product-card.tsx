import Image from 'next/image'
import Link from 'next/link'
import { categoryOf, formatPrice, statusOf, timeAgo, type Product } from '@/lib/products'
import { productImageUrl } from '@/lib/storage'
import { card } from '@/lib/styles'

export function ProductCard({ product }: { product: Product }) {
  const category = categoryOf(product.category)
  const status = statusOf(product.status)
  const sold = product.status === 'sold'
  const cover = product.images?.[0]
  const extra = (product.images?.length ?? 0) - 1

  return (
    <Link
      href={`/products/${product.id}`}
      className={`${card} group flex gap-4 p-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-pop`}
    >
      <div
        className={`relative size-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-soft ${
          sold ? 'opacity-50 grayscale' : ''
        }`}
      >
        {cover ? (
          <Image
            src={productImageUrl(cover)}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-4xl" aria-hidden>
            {category.emoji}
          </span>
        )}

        {extra > 0 ? (
          <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 text-[10px] font-bold text-white">
            +{extra}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-2 flex-1 leading-snug font-bold text-ink">{product.title}</h3>
          {product.status !== 'selling' ? (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${status.chip}`}>
              {status.label}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 text-xs text-ink-faint">
          📍 {product.region} · {timeAgo(product.created_at)}
        </p>

        <p className={`mt-1.5 text-lg font-bold ${sold ? 'text-ink-faint' : 'text-ink'}`}>
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-1.5 text-xs text-ink-faint">
          <span className="truncate">
            {product.profiles?.avatar_emoji ?? '🌽'} {product.profiles?.nickname ?? '알 수 없음'}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {product.favorite_count > 0 ? <span>❤️ {product.favorite_count}</span> : null}
            {product.view_count > 0 ? <span>👀 {product.view_count}</span> : null}
          </span>
        </div>
      </div>
    </Link>
  )
}
