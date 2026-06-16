'use client'

import { MessageDuJour } from '@/components/shared/message-du-jour'
import { HumeurDuJour } from '@/components/shared/humeur-du-jour'
import { QuestionDuJour } from '@/components/shared/question-du-jour'
import { Card } from '@/components/ui/card'
import type { MoodType } from '@/features/humeurs/actions'

interface QuestionData {
  texte: string
  maReponse: string | null
  reponsePartenaire: string | null
  partenaireARepondu: boolean
  prenomPartenaire: string
}

interface Props {
  messagePartenaire: { id: string; content: string; prenomAuteur: string } | null
  monMessage: { id: string; content: string } | null
  monHumeur: MoodType | null
  humeurPartenaire: { mood: MoodType; prenomUser: string } | null
  question: QuestionData | null
}

/**
 * « Widget » de la journée : message du jour, question du jour et humeur,
 * réunis dans une seule carte. Utilisé sur le dashboard et sur /aujourdhui.
 */
export function WidgetAujourdhui({ messagePartenaire, monMessage, monHumeur, humeurPartenaire, question }: Props) {
  return (
    <Card className="space-y-5 border-primary/15 bg-gradient-to-br from-primary-light/50 via-surface to-surface">
      {/* Message du jour */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">💌 Message du jour</p>
        <MessageDuJour messagePartenaire={messagePartenaire} monMessage={monMessage} />
      </div>

      {/* Question du jour */}
      {question && (
        <>
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">💭 Question du jour</p>
            <QuestionDuJour
              question={question.texte}
              maReponse={question.maReponse}
              reponsePartenaire={question.reponsePartenaire}
              partenaireARepondu={question.partenaireARepondu}
              prenomPartenaire={question.prenomPartenaire}
            />
          </div>
        </>
      )}

      <div className="h-px bg-border" />

      {/* Humeur du jour */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">🌤️ Humeur du jour</p>
        <HumeurDuJour monHumeur={monHumeur} humeurPartenaire={humeurPartenaire} />
      </div>
    </Card>
  )
}
