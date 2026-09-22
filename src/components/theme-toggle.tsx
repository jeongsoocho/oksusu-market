'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/** 지금 화면이 어두운 모드인지 밝은 모드인지 알아냅니다. */
function currentTheme(): Theme {
  const saved = document.documentElement.dataset.theme
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  // 서버에서는 어느 쪽인지 알 수 없으니, 화면에 붙고 나서 읽습니다.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => setTheme(currentTheme()), [])

  function toggle() {
    const next: Theme = (theme ?? currentTheme()) === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('oksusu-theme', next)
    } catch {
      // 사생활 보호 모드 등에서 저장이 막혀도 이번 방문에는 적용됩니다.
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '밝은 화면으로 바꾸기' : '어두운 화면으로 바꾸기'}
      title={theme === 'dark' ? '밝게' : '어둡게'}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base transition hover:bg-surface-soft"
    >
      {/* 화면에 붙기 전에는 아무것도 안 보여 깜빡임을 막습니다 */}
      <span className={theme ? '' : 'opacity-0'}>{theme === 'dark' ? '🌙' : '☀️'}</span>
    </button>
  )
}
