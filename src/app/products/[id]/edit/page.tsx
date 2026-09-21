import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PRODUCT_SELECT, type Product } from '@/lib/products'
import { productImageUrl } from '@/lib/storage'
import { ProductForm } from '@/components/product-form'

export const metadata: Metadata = { title: '글 수정 · 옥수수마켓 🌽' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/products/${id}/edit`)

  const { data } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle()

  const product = (data as unknown as Product) ?? null
  if (!product) notFound()

  // 남의 글은 고칠 수 없습니다. (DB 의 RLS 도 한 번 더 막아 줍니다)
  if (product.seller_id !== user.id) redirect(`/products/${id}`)

  return (
    <div className="animate-pop-in mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-cob-900">✏️ 글 수정</h1>
      <p className="mt-1 text-sm text-cob-700">고치고 싶은 내용을 바꿔 주세요</p>

      <div className="mt-6 rounded-3xl border-2 border-corn-200 bg-white/80 p-6 shadow-sm">
        <ProductForm
          product={product}
          existingImages={(product.images ?? []).map((path) => ({
            path,
            url: productImageUrl(path),
          }))}
        />
      </div>
    </div>
  )
}
