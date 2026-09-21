import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Supabase 보관함(Storage)에 있는 공개 사진만 불러올 수 있게 허용합니다.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      // 사진이 폼에 실려 서버로 가기 때문에 기본 1MB 로는 모자랍니다.
      // 브라우저에서 미리 줄여 보내므로 5장이어도 보통 2MB 안쪽입니다.
      bodySizeLimit: '4mb',
    },
  },
}

export default nextConfig
