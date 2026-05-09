'use client'

import { Trash2 } from 'lucide-react'
import { supprimerSouvenir } from '@/features/memories/actions'

export function BoutonSupprimer({ memoryId }: { memoryId: string }) {
  return (
    <form
      action={async () => {
        if (confirm('Supprimer ce souvenir définitivement ?')) {
          await supprimerSouvenir(memoryId)
        }
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium text-text-soft hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </form>
  )
}
