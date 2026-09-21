'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { STATUS_VALUES, validateProduct } from '@/lib/products'
import type { ProductFormState } from '@/lib/product-form-state'

/** 폼에서 온 값들을 한 번에 꺼내 정리합니다. */
function readForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    price: String(formData.get('price') ?? '').replace(/[,\s]/g, ''),
    category: String(formData.get('category') ?? ''),
    description: String(formData.get('description') ?? '').trim(),
    region: String(formData.get('region') ?? '').trim(),
  }
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const values = readForm(formData)

  const invalid = validateProduct(values)
  if (invalid) return { error: invalid, values }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 풀렸어요. 다시 로그인해 주세요.', values }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title: values.title,
      price: Number(values.price),
      category: values.category,
      description: values.description,
      region: values.region,
    })
    .select('id')
    .single()

  if (error) return { error: `글을 올리지 못했어요: ${error.message}`, values }

  revalidatePath('/products')
  revalidatePath('/')
  redirect(`/products/${data.id}`)
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const id = Number(formData.get('id'))
  const values = readForm(formData)

  if (!Number.isInteger(id)) return { error: '잘못된 글이에요.', values }

  const invalid = validateProduct(values)
  if (invalid) return { error: invalid, values }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 풀렸어요. 다시 로그인해 주세요.', values }

  // RLS 가 한 번 더 막아 주지만, 여기서도 작성자인지 확인합니다.
  const { data: updated, error } = await supabase
    .from('products')
    .update({
      title: values.title,
      price: Number(values.price),
      category: values.category,
      description: values.description,
      region: values.region,
    })
    .eq('id', id)
    .eq('seller_id', user.id)
    .select('id')

  if (error) return { error: `수정하지 못했어요: ${error.message}`, values }
  if (!updated || updated.length === 0) {
    return { error: '내가 올린 글만 고칠 수 있어요.', values }
  }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  redirect(`/products/${id}`)
}

/** 판매중 / 예약중 / 판매완료 바꾸기 */
export async function updateStatusAction(formData: FormData) {
  const id = Number(formData.get('id'))
  const status = String(formData.get('status') ?? '')

  if (!Number.isInteger(id) || !STATUS_VALUES.includes(status)) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('products')
    .update({ status })
    .eq('id', id)
    .eq('seller_id', user.id)

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) redirect('/products')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('products').delete().eq('id', id).eq('seller_id', user.id)

  revalidatePath('/products')
  revalidatePath('/')
  redirect('/products?deleted=1')
}
