'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

interface Props {
  lienPrecedent: string
  lienSuivant: string
  children: React.ReactNode
}

export function CalendrierSwipe({ lienPrecedent, lienSuivant, children }: Props) {
  const router = useRouter()
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null || startY.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    startX.current = null
    startY.current = null

    // Ignore si le mouvement est surtout vertical (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) < 40) return

    if (dx < 0) router.push(lienSuivant)
    else router.push(lienPrecedent)
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ touchAction: 'pan-y' }}>
      {children}
    </div>
  )
}
