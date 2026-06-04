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

// ─── Notifications push ───
self.addEventListener('push', (e) => {
  let data = {}
  try { data = e.data ? e.data.json() : {} } catch (err) {}
  const title = data.title || 'Notre Calendrier'
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || undefined,
    data: { url: data.url || '/dashboard' },
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = (e.notification.data && e.notification.data.url) || '/dashboard'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      for (const client of list) {
        if ('focus' in client) { if (client.navigate) client.navigate(url); return client.focus() }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
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
