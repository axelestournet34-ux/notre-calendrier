'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function InviterClient({ code }: { code: string }) {
  const [copie, setCopie] = useState(false)

  async function copier() {
    await navigator.clipboard.writeText(code)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div className="px-4 py-8 max-w-sm mx-auto space-y-5">
      <Card className="space-y-5 text-center">
        <div className="size-16 rounded-full bg-primary-light flex items-center justify-center text-3xl mx-auto">
          ♡
        </div>

        <div>
          <p className="text-sm text-text-muted mb-3">Donne ce code à Fanny lors de son inscription</p>
          <div className="bg-surface-raised rounded-2xl px-6 py-5 mx-auto inline-block w-full">
            <p className="text-4xl font-bold tracking-[0.3em] text-primary font-mono">
              {code}
            </p>
          </div>
        </div>

        <div className="text-xs text-text-muted space-y-1">
          <p>Valable 7 jours · à usage unique</p>
          <p>Fanny le rentre sur la page d&apos;inscription</p>
        </div>

        <Button onClick={copier} variant="secondary" className="w-full">
          {copie ? <><Check size={15} className="mr-1.5" />Copié !</> : <><Copy size={15} className="mr-1.5" />Copier le code</>}
        </Button>
      </Card>
    </div>
  )
}
