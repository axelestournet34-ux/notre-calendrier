'use client'

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Force la récupération du nouveau service worker (ex : ajout du push)
        reg.update().catch(() => {})
      })
      .catch(() => {})
  }, [])

  return null
}
