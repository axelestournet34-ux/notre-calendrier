'use client'

import { useActionState } from 'react'
import { creerCouple } from '@/features/couple/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(creerCouple, null)

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-3">
          <div className="size-16 rounded-2xl bg-primary-light flex items-center justify-center text-3xl mx-auto">
            ♡
          </div>
          <h1 className="text-2xl font-semibold text-text">Créez votre espace</h1>
          <p className="text-sm text-text-muted">
            Donnez un nom à votre histoire et invitez votre partenaire.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <form action={action} className="space-y-4">
            <Input
              label="Nom de votre histoire"
              name="nom"
              type="text"
              placeholder="ex. Axel & Fanny"
              required
              hint="Ce nom apparaîtra dans votre espace partagé"
            />

            <Input
              label="Date de début (optionnel)"
              name="dateDebut"
              type="date"
              hint="Votre date officielle, première rencontre, etc."
            />

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <Button type="submit" loading={pending} className="w-full">
              Créer notre espace
            </Button>
          </form>
        </div>

        <p className="text-xs text-center text-text-muted">
          Vous pourrez inviter votre partenaire depuis le tableau de bord.
        </p>
      </div>
    </div>
  )
}
