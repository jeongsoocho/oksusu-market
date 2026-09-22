/**
 * 자주 쓰는 모양을 한곳에 모았습니다.
 * 버튼이나 카드 생김새를 바꾸고 싶으면 이 파일만 고치면 앱 전체가 따라옵니다.
 */

export const card =
  'rounded-3xl border border-line bg-surface shadow-soft'

export const cardSoft =
  'rounded-3xl border border-line-soft bg-surface-soft'

export const cardDashed =
  'rounded-3xl border-2 border-dashed border-line bg-surface/50'

/** 가장 눈에 띄는 버튼 (옥수수 노랑) */
export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-2xl bg-brand px-5 py-3 font-bold text-on-brand shadow-[0_3px_0_0_var(--brand-strong)] transition active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0'

/** 두 번째 버튼 (초록) */
export const btnAccent =
  'inline-flex items-center justify-center gap-1.5 rounded-2xl bg-accent px-5 py-3 font-bold text-on-accent shadow-[0_3px_0_0_var(--accent-strong)] transition active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60'

/** 테두리만 있는 버튼 */
export const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-surface px-5 py-3 font-bold text-ink-soft transition hover:bg-surface-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-60'

/** 글자만 있는 작은 버튼 */
export const btnQuiet =
  'inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition hover:bg-brand-soft hover:text-ink'

/** 위험한 동작 */
export const btnDanger =
  'inline-flex items-center justify-center gap-1.5 rounded-2xl border border-danger/40 bg-danger-soft px-5 py-3 font-bold text-danger transition hover:border-danger'

export const input =
  'w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-ink-faint focus:border-brand focus:ring-4 focus:ring-brand/25'

/** 카테고리·필터에 쓰는 동그란 칩 */
export function chip(active: boolean) {
  return [
    'inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition',
    active
      ? 'border-brand-strong bg-brand text-on-brand'
      : 'border-line bg-surface text-ink-soft hover:bg-surface-soft hover:text-ink',
  ].join(' ')
}

export const label = 'mb-1.5 block text-sm font-semibold text-ink-soft'

export const hint = 'mt-1.5 block text-xs text-ink-faint'

export const sectionTitle = 'font-display text-2xl text-ink'

export const pageTitle = 'font-display text-3xl text-ink'
