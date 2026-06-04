'use client'

import { useActionState, useState } from 'react'
import { creerCouple, rejoindreAvecCode } from '@/features/couple/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OnboardingPage() {
  const [onglet, setOnglet] = useState<'creer' | 'rejoindre'>('creer')
  const [stateCreer, actionCreer, pendingCreer] = useActionState(creerCouple, null)
  const [stateRejoindre, actionRejoindre, pendingRejoindre] = useActionState(rejoindreAvecCode, null)

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="size-16 rounded-2xl bg-primary-light flex items-center justify-center text-3xl mx-auto">
            ♡
          </div>
          <h1 className="text-2xl font-semibold text-text">Bienvenue</h1>
          <p className="text-sm text-text-muted">
            Créez un nouvel espace ou rejoignez celui de votre partenaire.
          </p>
        </div>

        <div className="flex rounded-xl bg-surface-raised p-1 gap-1">
          <button
            onClick={() => setOnglet('creer')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              onglet === 'creer'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Créer un espace
          </button>
          <button
            onClick={() => setOnglet('rejoindre')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              onglet === 'rejoindre'
                ? 'bg-surface text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            J&apos;ai un code
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          {onglet === 'creer' ? (
            <form action={actionCreer} className="space-y-4">
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
              {stateCreer?.error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {stateCreer.error}
                </p>
              )}
              <Button type="submit" loading={pendingCreer} className="w-full">
                Créer notre espace
              </Button>
            </form>
          ) : (
            <form action={actionRejoindre} className="space-y-4">
              <div className="text-center space-y-2 pb-2">
                <p className="text-sm text-text-muted">
                  Votre partenaire vous a donné un code à 8 caractères.
                </p>
              </div>
              <Input
                label="Code d'invitation"
                name="code"
                type="text"
                placeholder="ex. A3F82B1C"
                maxLength={8}
                autoComplete="off"
                className="text-center tracking-widest font-mono text-lg uppercase"
                required
              />
              {stateRejoindre?.error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {stateRejoindre.error}
                </p>
              )}
              <Button type="submit" loading={pendingRejoindre} className="w-full">
                Rejoindre l&apos;espace
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
