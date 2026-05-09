'use client'

import { useTransition } from 'react'
import { changerHumeur, type MoodType } from '@/features/humeurs/actions'
import { cn } from '@/utils/cn'

const HUMEURS: { value: MoodType; emoji: string; label: string }[] = [
  { value: 'heureux',     emoji: '😊', label: 'Heureux' },
  { value: 'amoureux',   emoji: '🥰', label: 'Amoureux' },
  { value: 'fatigue',    emoji: '😴', label: 'Fatigué' },
  { value: 'stresse',    emoji: '😤', label: 'Stressé' },
  { value: 'nostalgique', emoji: '🥹', label: 'Nostalgique' },
  { value: 'excite',     emoji: '🤩', label: 'Excité' },
]

interface HumeurInfo {
  mood: MoodType
  prenomUser: string
}

interface Props {
  monHumeur: MoodType | null
  humeurPartenaire: HumeurInfo | null
}

export function HumeurDuJour({ monHumeur, humeurPartenaire }: Props) {
  const [isPending, startTransition] = useTransition()

  function getEmoji(mood: MoodType) {
    return HUMEURS.find((h) => h.value === mood)?.emoji ?? '😊'
  }

  function onChanger(value: MoodType) {
    startTransition(async () => { await changerHumeur(value) })
  }

  return (
    <div className="space-y-3">

      {/* Humeur du/de la partenaire */}
      {humeurPartenaire && (
        <div className="flex items-center gap-2 text-sm text-text-soft">
          <span className="text-xl">{getEmoji(humeurPartenaire.mood)}</span>
          <span>
            <span className="font-medium text-text">{humeurPartenaire.prenomUser}</span> est{' '}
            {HUMEURS.find((h) => h.value === humeurPartenaire.mood)?.label.toLowerCase() ?? ''}
          </span>
        </div>
      )}

      {/* Sélecteur humeur */}
      <div>
        <p className="text-[11px] text-text-muted mb-2">Votre humeur aujourd'hui</p>
        <div className="flex gap-2 flex-wrap">
          {HUMEURS.map(({ value, emoji, label }) => (
            <button
              key={value}
              onClick={() => onChanger(value)}
              disabled={isPending}
              title={label}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
                monHumeur === value
                  ? 'bg-primary-light border-primary text-primary'
                  : 'bg-surface border-border text-text-muted hover:border-primary/40 hover:bg-primary-light/30',
                'disabled:opacity-60'
              )}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
