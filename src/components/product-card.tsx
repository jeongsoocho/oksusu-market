import Image from 'next/image'
import Link from 'next/link'
import { categoryOf, formatPrice, statusOf, timeAgo, type Product } from '@/lib/products'
import { productImageUrl } from '@/lib/storage'

export function ProductCard({ product }: { product: Product }) {
  const category = categoryOf(product.category)
  const status = statusOf(product.status)
  const sold = product.status === 'sold'
  const cover = product.images?.[0]

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex gap-4 rounded-3xl border-2 border-corn-200 bg-white/80 p-4 transition hover:border-corn-400 hover:bg-corn-50"
    >
      <div
        className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 border-corn-200 bg-corn-100 transition group-hover:scale-105 ${
          sold ? 'opacity-50 grayscale' : ''
        }`}
      >
        {cover ? (
          <Image
            src={productImageUrl(cover)}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-4xl" aria-hidden>
            {category.emoji}
          </span>
        )}

        {product.images?.length > 1 ? (
          <span className="absolute bottom-0 right-0 rounded-tl-lg bg-cob-900/70 px-1.5 text-[10px] font-bold text-white">
            {product.images.length}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-2 flex-1 font-bold text-cob-900">{product.title}</h3>
          {product.status !== 'selling' ? (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${status.chip}`}>
              {status.label}
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 text-xs text-cob-500">
          📍 {product.region} · {timeAgo(product.created_at)}
        </p>

        <p className={`mt-1.5 text-lg font-bold ${sold ? 'text-cob-500' : 'text-cob-900'}`}>
          {formatPrice(product.price)}
        </p>

        <p className="mt-1 truncate text-xs text-cob-500">
          {product.profiles?.avatar_emoji ?? '🌽'} {product.profiles?.nickname ?? '알 수 없음'}
          {' · '}
          {category.label}
        </p>
      </div>
    </Link>
  )
}
