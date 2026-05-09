'use client'

import { useActionState, useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { mettreAJourCouple, creerLienInvitation } from './actions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Couple = { id: string; name: string; start_date: string | null }
type Membre = { user_id: string; role: string; profiles: { full_name: string | null } }

export function CoupleClient({
  couple, membres, coupleId, isOwner
}: {
  couple: Couple; membres: Membre[]; coupleId: string; isOwner: boolean
}) {
  const [state, action, pending] = useActionState(mettreAJourCouple, null)
  const [lienInvitation, setLienInvitation] = useState<string | null>(null)
  const [copie, setCopie] = useState(false)
  const [chargementInvit, setChargementInvit] = useState(false)

  async function genererLien() {
    setChargementInvit(true)
    const res = await creerLienInvitation(coupleId)
    if (res?.token) {
      const url = `${window.location.origin}/invitation/${res.token}`
      setLienInvitation(url)
    }
    setChargementInvit(false)
  }

  async function copierLien() {
    if (!lienInvitation) return
    await navigator.clipboard.writeText(lienInvitation)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  return (
    <div className="px-4 lg:px-6 py-6 max-w-md mx-auto w-full space-y-5">

      {/* Membres */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <p className="text-sm font-medium text-text">Membres du couple</p>
        </div>
        <div className="space-y-2">
          {membres.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-primary-light flex items-center justify-center text-sm font-medium text-primary">
                {m.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-text">{m.profiles?.full_name ?? 'Utilisateur'}</p>
                <p className="text-xs text-text-muted capitalize">{m.role}</p>
              </div>
            </div>
          ))}
          {membres.length < 2 && (
            <p className="text-xs text-text-muted italic">En attente d&apos;un·e partenaire...</p>
          )}
        </div>
      </Card>

      {/* Invitation */}
      {membres.length < 2 && (
        <Card className="space-y-3">
          <p className="text-sm font-medium text-text">Inviter votre partenaire</p>
          {!lienInvitation ? (
            <Button
              variant="secondary"
              loading={chargementInvit}
              onClick={genererLien}
              className="w-full"
            >
              Générer un lien d&apos;invitation
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-surface-raised rounded-xl">
                <p className="text-xs text-text-muted truncate flex-1">{lienInvitation}</p>
                <button onClick={copierLien} className="shrink-0 text-primary">
                  {copie ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-text-muted">Ce lien est valable 7 jours.</p>
            </div>
          )}
        </Card>
      )}

      {/* Modifier couple */}
      {isOwner && (
        <Card className="space-y-4">
          <p className="text-sm font-medium text-text">Modifier notre histoire</p>
          <form action={action} className="space-y-3">
            <Input label="Nom" name="nom" type="text" defaultValue={couple.name} required />
            <Input label="Date de début" name="dateDebut" type="date" defaultValue={couple.start_date ?? ''} />
            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
            <Button type="submit" loading={pending}>Enregistrer</Button>
          </form>
        </Card>
      )}
    </div>
  )
}
