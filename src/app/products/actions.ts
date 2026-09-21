'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { STATUS_VALUES, validateProduct } from '@/lib/products'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_BYTES,
  PRODUCT_BUCKET,
  isOwnImagePath,
  newImagePath,
} from '@/lib/storage'
import type { ProductFormState } from '@/lib/product-form-state'
import type { SupabaseClient } from '@supabase/supabase-js'

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

/** 수정할 때 "그대로 둘 사진" 목록. 남의 폴더 경로가 섞여 오면 버립니다. */
function readKeptImages(formData: FormData, userId: string) {
  return formData
    .getAll('keepImages')
    .map(String)
    .filter((path) => path && isOwnImagePath(path, userId))
    .slice(0, MAX_IMAGES)
}

/**
 * 폼에 담겨 온 사진 파일들을 Storage 에 올리고, 저장된 경로를 돌려줍니다.
 * 한 장이라도 실패하면 이미 올린 것을 되돌린 뒤 사유를 알려 줍니다.
 */
async function uploadImages(
  supabase: SupabaseClient,
  formData: FormData,
  userId: string,
  slots: number,
): Promise<{ paths: string[]; error?: string }> {
  const files = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (files.length === 0) return { paths: [] }
  if (files.length > slots) {
    return { paths: [], error: `사진은 모두 합쳐 ${MAX_IMAGES}장까지 올릴 수 있어요.` }
  }

  const uploaded: string[] = []

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      await removeImages(supabase, uploaded)
      return { paths: [], error: 'JPG, PNG, WEBP 사진만 올릴 수 있어요.' }
    }
    if (file.size > MAX_IMAGE_BYTES) {
      await removeImages(supabase, uploaded)
      return { paths: [], error: '사진 한 장은 5MB 까지예요.' }
    }

    const path = newImagePath(userId, file.type)
    const { error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) {
      await removeImages(supabase, uploaded)
      return { paths: [], error: `사진을 올리지 못했어요: ${error.message}` }
    }
    uploaded.push(path)
  }

  return { paths: uploaded }
}

/** 보관함에서 사진 지우기 (실패해도 글 작업 자체는 막지 않습니다) */
async function removeImages(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return
  await supabase.storage.from(PRODUCT_BUCKET).remove(paths)
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

  // 사진을 먼저 보관함에 올리고, 성공하면 그 경로를 글과 함께 저장합니다.
  const { paths, error: uploadError } = await uploadImages(
    supabase,
    formData,
    user.id,
    MAX_IMAGES,
  )
  if (uploadError) return { error: uploadError, values }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title: values.title,
      price: Number(values.price),
      category: values.category,
      description: values.description,
      region: values.region,
      images: paths,
    })
    .select('id')
    .single()

  if (error) {
    // 글 저장에 실패했으면 방금 올린 사진도 치웁니다.
    await removeImages(supabase, paths)
    return { error: `글을 올리지 못했어요: ${error.message}`, values }
  }

  revalidatePath('/products')
  revalidatePath('/')
  revalidatePath('/mypage')
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

  // 지금 글에 붙어 있는 사진 (내 글이 맞는지도 이때 같이 확인됩니다)
  const { data: current } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .eq('seller_id', user.id)
    .maybeSingle()

  if (!current) return { error: '내가 올린 글만 고칠 수 있어요.', values }

  const before: string[] = current.images ?? []
  const kept = readKeptImages(formData, user.id).filter((path) => before.includes(path))

  const { paths: added, error: uploadError } = await uploadImages(
    supabase,
    formData,
    user.id,
    MAX_IMAGES - kept.length,
  )
  if (uploadError) return { error: uploadError, values }

  const images = [...kept, ...added]

  const { data: updated, error } = await supabase
    .from('products')
    .update({
      title: values.title,
      price: Number(values.price),
      category: values.category,
      description: values.description,
      region: values.region,
      images,
    })
    .eq('id', id)
    .eq('seller_id', user.id)
    .select('id')

  if (error) {
    await removeImages(supabase, added)
    return { error: `수정하지 못했어요: ${error.message}`, values }
  }
  if (!updated || updated.length === 0) {
    await removeImages(supabase, added)
    return { error: '내가 올린 글만 고칠 수 있어요.', values }
  }

  // 사용자가 뺀 사진은 보관함에서도 치웁니다.
  await removeImages(
    supabase,
    before.filter((path) => !images.includes(path)),
  )

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  revalidatePath('/mypage')
  redirect(`/products/${id}`)
}

/**
 * 판매중 / 예약중 / 판매완료 바꾸기.
 *
 * 폼(FormData)이 아니라 값을 바로 받습니다. 그래야 버튼에서 곧장 부를 수 있고,
 * 화면은 먼저 바뀌고 저장이 뒤따라가는 방식(낙관적 갱신)을 쓸 수 있습니다.
 */
export async function setProductStatus(id: number, status: string) {
  if (!Number.isInteger(id) || !STATUS_VALUES.includes(status)) {
    return { error: '알 수 없는 상태예요.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 풀렸어요. 다시 로그인해 주세요.' }

  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) return { error: `상태를 바꾸지 못했어요: ${error.message}` }

  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  revalidatePath('/mypage')
  return {}
}

export async function deleteProductAction(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) redirect('/products')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 글을 지우기 전에 어떤 사진이 붙어 있었는지 먼저 챙겨 둡니다.
  const { data: doomed } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .eq('seller_id', user.id)
    .maybeSingle()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  // 글이 지워졌을 때만 사진도 치웁니다.
  if (!error) await removeImages(supabase, doomed?.images ?? [])

  revalidatePath('/products')
  revalidatePath('/')
  revalidatePath('/mypage')
  redirect('/products?deleted=1')
}
