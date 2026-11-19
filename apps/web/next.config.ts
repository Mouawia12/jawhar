import path from 'path'
import { fileURLToPath } from 'url'

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(dirname, '../..')
const api = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  transpilePackages: ['@jawhar/shared'],
  outputFileTracingRoot: monorepoRoot,
  turbopack: { root: monorepoRoot },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: api.protocol.replace(':', '') as 'http' | 'https',
        hostname: api.hostname,
        port: api.port,
        pathname: '/api/media/file/**',
      },
    ],
    // The API runs on localhost in development; Next 16 blocks private IPs by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
}

export default withNextIntl(nextConfig)
