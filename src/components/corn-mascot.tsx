type Props = {
  /** 픽셀 단위 높이 */
  size?: number
  /** 둥실둥실 흔들리게 할지 */
  wiggle?: boolean
  className?: string
}

/** 옥수수마켓 마스코트 🌽 */
export function CornMascot({ size = 140, wiggle = false, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 140 170"
      height={size}
      width={(size * 140) / 170}
      role="img"
      aria-label="옥수수 마스코트"
      className={`${wiggle ? 'animate-wiggle' : ''} ${className}`}
    >
      <defs>
        <pattern id="corn-kernels" width="16" height="14" patternUnits="userSpaceOnUse">
          <rect width="16" height="14" fill="var(--color-corn-400)" />
          <ellipse cx="4" cy="3.5" rx="5.6" ry="4.6" fill="var(--color-corn-300)" />
          <ellipse cx="12" cy="10.5" rx="5.6" ry="4.6" fill="var(--color-corn-300)" />
        </pattern>
        <clipPath id="corn-body-clip">
          <path d="M70 10 C 101 10, 117 46, 117 91 C 117 131, 96 152, 70 152 C 44 152, 23 131, 23 91 C 23 46, 39 10, 70 10 Z" />
        </clipPath>
      </defs>

      {/* 껍질 잎 */}
      <path
        d="M70 150 C 47 155, 22 143, 9 117 C 33 108, 58 124, 70 150 Z"
        fill="var(--color-husk-500)"
      />
      <path
        d="M70 150 C 93 155, 118 143, 131 117 C 107 108, 82 124, 70 150 Z"
        fill="var(--color-husk-600)"
      />
      <path d="M22 122 C 40 124, 57 134, 68 148" stroke="var(--color-husk-700)" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M118 122 C 100 124, 83 134, 72 148" stroke="var(--color-husk-700)" strokeWidth="2" fill="none" opacity="0.4" />

      {/* 알맹이 몸통 */}
      <g clipPath="url(#corn-body-clip)">
        <rect x="0" y="0" width="140" height="170" fill="url(#corn-kernels)" />
      </g>
      <path
        d="M70 10 C 101 10, 117 46, 117 91 C 117 131, 96 152, 70 152 C 44 152, 23 131, 23 91 C 23 46, 39 10, 70 10 Z"
        fill="none"
        stroke="var(--color-corn-600)"
        strokeWidth="3"
      />

      {/* 볼터치 */}
      <ellipse cx="43" cy="103" rx="8" ry="5" fill="#ff8f7a" opacity="0.5" />
      <ellipse cx="97" cy="103" rx="8" ry="5" fill="#ff8f7a" opacity="0.5" />

      {/* 눈 */}
      <ellipse cx="56" cy="88" rx="5" ry="6.5" fill="var(--color-cob-900)" />
      <ellipse cx="84" cy="88" rx="5" ry="6.5" fill="var(--color-cob-900)" />
      <circle cx="57.8" cy="85.4" r="1.9" fill="#fff" />
      <circle cx="85.8" cy="85.4" r="1.9" fill="#fff" />

      {/* 입 */}
      <path
        d="M61 101 Q 70 111, 79 101"
        stroke="var(--color-cob-900)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
