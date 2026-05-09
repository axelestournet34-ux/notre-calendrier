'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { seConnecter } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ConnexionPage() {
  const [state, action, pending] = useActionState(seConnecter, null)

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-text">Bon retour ♡</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Reconnectez-vous pour retrouver vos souvenirs.
        </p>
      </div>

      <form action={action} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" loading={pending} className="w-full mt-2">
          Se connecter
        </Button>
      </form>

      <p className="text-sm text-center text-text-muted">
        Pas encore de compte ?{' '}
        <Link
          href="/inscription"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
