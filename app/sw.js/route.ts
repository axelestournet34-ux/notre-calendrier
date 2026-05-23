import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export function GET() {
  const sw = `
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') return
  e.respondWith(fetch(e.request).catch(() => new Response('', { status: 408 })))
})
`.trim()

  return new NextResponse(sw, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    },
  })
}
