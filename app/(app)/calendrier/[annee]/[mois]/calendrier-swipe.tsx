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
  const touchStartX = useRef<number | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 50) return
    if (delta < 0) router.push(lienSuivant)
    else router.push(lienPrecedent)
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  )
}
