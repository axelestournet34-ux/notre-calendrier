import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Notre Calendrier',
    short_name: 'Nos Souvenirs',
    description: 'Notre espace privé de souvenirs partagés.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#c47c82',
    orientation: 'portrait',
    icons: [
      {
        src: '/catoune.jpg',
        sizes: 'any',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  }
}
