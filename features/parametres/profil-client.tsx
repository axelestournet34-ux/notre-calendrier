'use client'

import { useActionState } from 'react'
import { mettreAJourProfil } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Profile = { id: string; full_name: string | null; avatar_url: string | null }

export function ProfilClient({ profile, email }: { profile: Profile | null; email: string }) {
  const [state, action, pending] = useActionState(mettreAJourProfil, null)

  return (
    <div className="px-4 lg:px-6 py-6 max-w-md mx-auto w-full space-y-5">
      {/* Avatar */}
      <Card className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-primary-light flex items-center justify-center text-2xl font-semibold text-primary shrink-0">
          {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-medium text-text">{profile?.full_name ?? 'Vous'}</p>
          <p className="text-sm text-text-muted">{email}</p>
        </div>
      </Card>

      {/* Formulaire */}
      <Card className="space-y-4">
        <p className="text-sm font-medium text-text">Modifier mon prénom</p>
        <form action={action} className="space-y-3">
          <Input
            label="Prénom"
            name="prenom"
            type="text"
            defaultValue={profile?.full_name ?? ''}
            placeholder="Votre prénom"
            required
          />
          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
          <Button type="submit" loading={pending}>Enregistrer</Button>
        </form>
      </Card>
    </div>
  )
}
