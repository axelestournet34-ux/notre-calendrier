'use client'

import { useTransition } from 'react'
import { toggleReaction } from '@/features/reactions/actions'
import { cn } from '@/utils/cn'
import type { ReactionType } from '@/types/database.types'

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'coeur',     emoji: '♡',  label: 'Amour' },
  { type: 'rire',      emoji: '😄', label: 'Rire' },
  { type: 'etoile',   emoji: '⭐', label: 'Étoile' },
  { type: 'nostalgie', emoji: '🥹', label: 'Nostalgie' },
]

type ReactionCount = { type: string; count: number; mienne: boolean }

interface Props {
  memoryId: string
  reactions: ReactionCount[]
}

export function ReactionBar({ memoryId, reactions }: Props) {
  const [isPending, startTransition] = useTransition()

  function onReagir(type: ReactionType) {
    startTransition(() => toggleReaction(memoryId, type))
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const info = reactions.find((r) => r.type === type)
        const mienne = info?.mienne ?? false
        const count = info?.count ?? 0

        return (
          <button
            key={type}
            onClick={() => onReagir(type)}
            disabled={isPending}
            title={label}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150',
              mienne
                ? 'bg-primary-light border-primary text-primary'
                : 'bg-surface border-border text-text-soft hover:border-primary/40 hover:bg-primary-light/40',
              'disabled:opacity-60'
            )}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
