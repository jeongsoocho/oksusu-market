import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/product-form'

export const metadata: Metadata = { title: '글 쓰기 · 옥수수마켓 🌽' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 미들웨어가 먼저 막지만, 페이지에서도 반드시 확인합니다.
  if (!user) redirect('/login?next=/products/new')

  return (
    <div className="animate-pop-in mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-cob-900">✏️ 거래 글 쓰기</h1>
      <p className="mt-1 text-sm text-cob-700">쓰지 않는 물건에 새 주인을 찾아 주세요 🌽</p>

      <div className="mt-6 rounded-3xl border-2 border-corn-200 bg-white/80 p-6 shadow-sm">
        <ProductForm />
      </div>
    </div>
  )
}
