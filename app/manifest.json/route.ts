import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  const manifest = {
    name: 'Nos Souvenirs',
    short_name: 'Nos Souvenirs',
    description: 'Notre espace privé de souvenirs et de moments partagés.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#faf8f5',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
}
