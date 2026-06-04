'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { sInscrire } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function InscriptionPage() {
  const [state, action, pending] = useActionState(sInscrire, null)

  if (state?.success) {
    return (
      <div className="text-center space-y-4">
        <div className="size-16 rounded-full bg-primary-light flex items-center justify-center text-3xl mx-auto">
          ✉️
        </div>
        <h2 className="text-xl font-semibold text-text">Vérifiez vos emails</h2>
        <p className="text-sm text-text-muted">{state.success}</p>
        <Link href="/connexion" className="text-sm text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-text">Créer votre espace ♡</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Commencez à capturer vos plus beaux moments.
        </p>
      </div>

      <form action={action} className="space-y-4">
        <Input
          label="Prénom"
          name="prenom"
          type="text"
          placeholder="Votre prénom"
          autoComplete="given-name"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          required
        />

        <Input
          label="Mot de passe"
          name="motDePasse"
          type="password"
          placeholder="Au moins 8 caractères"
          autoComplete="new-password"
          required
          hint="8 caractères minimum"
        />

        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" loading={pending} className="w-full mt-2">
          Créer mon compte
        </Button>
      </form>

      <p className="text-sm text-center text-text-muted">
        Déjà un compte ?{' '}
        <Link
          href="/connexion"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
