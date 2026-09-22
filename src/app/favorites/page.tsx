import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PRODUCT_SELECT, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { EmptyState } from '@/components/empty-state'
import { pageTitle } from '@/lib/styles'

export const metadata: Metadata = { title: '찜한 물건' }

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/favorites')

  const { data } = await supabase
    .from('favorites')
    .select(`created_at, products(${PRODUCT_SELECT})`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = (data ?? [])
    .map((row) => (row as unknown as { products: Product | null }).products)
    .filter((p): p is Product => Boolean(p))

  return (
    <div className="animate-pop-in space-y-5">
      <h1 className={pageTitle}>❤️ 찜한 물건</h1>

      {products.length === 0 ? (
        <EmptyState
          title="아직 찜한 물건이 없어요"
          description="마음에 드는 물건의 하트를 눌러 두면 여기 모입니다."
          actionHref="/products"
          actionLabel="구경하러 가기"
        />
      ) : (
        <>
          <p className="text-sm text-ink-faint">{products.length}개</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
