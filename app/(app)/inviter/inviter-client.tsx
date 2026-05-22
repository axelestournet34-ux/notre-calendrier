'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function InviterClient({ lien }: { lien: string }) {
  const [copie, setCopie] = useState(false)

  async function copier() {
    await navigator.clipboard.writeText(lien)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div className="px-4 py-8 max-w-md mx-auto space-y-5">
      <Card className="space-y-4 text-center">
        <div className="size-16 rounded-full bg-primary-light flex items-center justify-center text-3xl mx-auto">
          ♡
        </div>
        <div>
          <p className="text-base font-semibold text-text">Lien d&apos;invitation pour Fanny</p>
          <p className="text-xs text-text-muted mt-1">Valable 7 jours · à usage unique</p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-surface-raised rounded-xl text-left">
          <p className="text-xs text-text-muted truncate flex-1">{lien}</p>
          <button onClick={copier} className="shrink-0 text-primary p-1">
            {copie ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <Button onClick={copier} className="w-full">
          {copie ? 'Copié !' : 'Copier le lien'}
        </Button>
      </Card>
    </div>
  )
}
