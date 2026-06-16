import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  const manifest = {
    name: 'Nos Souvenirs',
    short_name: 'Nos Souvenirs',
    description: 'Notre espace privé de souvenirs et de moments partagés.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
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
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Écrire le message du jour',
        short_name: 'Message du jour',
        description: 'Écris ton message du jour et lis celui de ton/ta partenaire',
        url: '/aujourdhui',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Ajouter un souvenir',
        short_name: 'Souvenir',
        description: 'Ajoute un souvenir avec photos',
        url: '/souvenirs/nouveau',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
}
