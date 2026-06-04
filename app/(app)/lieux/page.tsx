import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { CarteLieuxWrapper } from '@/components/carte/carte-lieux-wrapper'

export default async function LieuxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('id, title, date, lieu')
    .eq('couple_id', memberRow.couple_id)
    .not('lieu', 'is', null)
    .order('date', { ascending: false }) as {
      data: { id: string; title: string; date: string; lieu: string }[] | null
    }

  // Grouper par lieu
  const parLieu = new Map<string, { id: string; title: string; date: string }[]>()
  for (const s of souvenirs ?? []) {
    if (!s.lieu) continue
    if (!parLieu.has(s.lieu)) parLieu.set(s.lieu, [])
    parLieu.get(s.lieu)!.push({ id: s.id, title: s.title, date: s.date })
  }

  const lieuxPourCarte = Array.from(parLieu.entries()).map(([nom, items]) => ({
    nom,
    count: items.length,
  }))

  return (
    <>
      <Header
        title="Nos lieux"
        subtitle={`${parLieu.size} lieu${parLieu.size > 1 ? 'x' : ''} visité${parLieu.size > 1 ? 's' : ''}`}
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">

        {parLieu.size === 0 && (
          <Card className="text-center py-14 space-y-3">
            <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">📍</div>
            <p className="text-sm text-text-muted">
              Aucun lieu enregistré.<br />
              Ajoutez un lieu à vos souvenirs !
            </p>
          </Card>
        )}

        {/* Carte interactive */}
        {parLieu.size > 0 && (
          <CarteLieuxWrapper lieux={lieuxPourCarte} />
        )}

        {/* Liste */}
        {Array.from(parLieu.entries()).map(([lieu, items]) => (
          <Card key={lieu} className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text">{lieu}</p>
                <p className="text-xs text-text-muted">{items.length} souvenir{items.length > 1 ? 's' : ''}</p>
              </div>
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(lieu)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline shrink-0"
              >
                Voir sur la carte →
              </a>
            </div>
            <div className="space-y-1 pl-6">
              {items.slice(0, 3).map((s) => (
                <Link key={s.id} href={`/souvenirs/${s.id}`}
                  className="flex items-center gap-2 text-sm text-text-soft hover:text-text transition-colors">
                  <span className="size-1 rounded-full bg-border shrink-0" />
                  <span className="truncate">{s.title}</span>
                </Link>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-text-muted pl-3">+{items.length - 3} autre{items.length - 3 > 1 ? 's' : ''}…</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
