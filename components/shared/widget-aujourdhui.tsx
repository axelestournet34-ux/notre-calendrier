'use client'

import { MessageDuJour } from '@/components/shared/message-du-jour'
import { HumeurDuJour } from '@/components/shared/humeur-du-jour'
import { Card } from '@/components/ui/card'
import type { MoodType } from '@/features/humeurs/actions'

interface Props {
  messagePartenaire: { id: string; content: string; prenomAuteur: string } | null
  monMessage: { id: string; content: string } | null
  monHumeur: MoodType | null
  humeurPartenaire: { mood: MoodType; prenomUser: string } | null
}

/**
 * « Widget » de la journée : message du jour (lire celui du partenaire +
 * écrire le sien) et humeur (la sienne + celle du partenaire), réunis dans
 * une seule carte. Utilisé sur le dashboard et sur la page /aujourdhui.
 */
export function WidgetAujourdhui({ messagePartenaire, monMessage, monHumeur, humeurPartenaire }: Props) {
  return (
    <Card className="space-y-5 border-primary/15 bg-gradient-to-br from-primary-light/50 via-surface to-surface">
      {/* Message du jour */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">💌 Message du jour</p>
        <MessageDuJour messagePartenaire={messagePartenaire} monMessage={monMessage} />
      </div>

      <div className="h-px bg-border" />

      {/* Humeur du jour */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">🌤️ Humeur du jour</p>
        <HumeurDuJour monHumeur={monHumeur} humeurPartenaire={humeurPartenaire} />
      </div>
    </Card>
  )
}
