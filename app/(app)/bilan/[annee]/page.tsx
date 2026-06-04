import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { BoutonImprimer } from '@/components/shared/bouton-imprimer'

interface Props { params: Promise<{ annee: string }> }

const NOMS_MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

const EMOJIS_TYPE: Record<string, string> = {
  sortie:'🎉',voyage:'✈️',repas:'🍽',anniversaire:'🎂',
  quotidien:'☀️',premiere_fois:'⭐',autre:'♡',
}

export default async function BilanAnnuelPage({ params }: Props) {
  const { annee } = await params
  const anneeNum = Number(annee)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id, couples(name, start_date)').eq('user_id', user.id).single() as {
      data: { couple_id: string; couples: { name: string; start_date: string | null } } | null
    }
  if (!memberRow) redirect('/onboarding')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('id, date, title, type, lieu, memory_photos(id, media_type)')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', `${anneeNum}-01-01`)
    .lte('date', `${anneeNum}-12-31`)
    .order('date') as {
      data: { id: string; date: string; title: string; type: string; lieu: string | null; memory_photos: { id: string; media_type: string }[] }[] | null
    }

  const liste = souvenirs ?? []
  const totalSouvenirs = liste.length
  const totalPhotos = liste.reduce((a, s) => a + s.memory_photos.filter(p => p.media_type === 'photo').length, 0)
  const totalVideos = liste.reduce((a, s) => a + s.memory_photos.filter(p => p.media_type === 'video').length, 0)

  // Mois le plus actif
  const parMois = Array.from({ length: 12 }, (_, i) => ({
    mois: i + 1,
    count: liste.filter(s => new Date(s.date).getMonth() === i).length,
  }))
  const moisMax = parMois.reduce((a, b) => b.count > a.count ? b : a, { mois: 1, count: 0 })

  // Type préféré
  const parType: Record<string, number> = {}
  liste.forEach(s => { parType[s.type] = (parType[s.type] ?? 0) + 1 })
  const typeMax = Object.entries(parType).sort((a, b) => b[1] - a[1])[0]

  // Lieux uniques
  const lieux = [...new Set(liste.map(s => s.lieu).filter(Boolean))]

  // Jours ensemble cette année
  const debut = memberRow.couples.start_date
    ? new Date(Math.max(new Date(memberRow.couples.start_date).getTime(), new Date(`${anneeNum}-01-01`).getTime()))
    : new Date(`${anneeNum}-01-01`)
  const fin = new Date(Math.min(new Date(`${anneeNum}-12-31`).getTime(), new Date().getTime()))
  const joursEnsemble = Math.max(0, Math.floor((fin.getTime() - debut.getTime()) / 86400000))

  const anneePrec = anneeNum - 1
  const anneeSuiv = anneeNum + 1
  const maintenant = new Date().getFullYear()

  return (
    <>
      <Header title={`Bilan ${anneeNum}`} subtitle={memberRow.couples.name} />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-6 print:space-y-4">

        {/* Navigation années */}
        <div className="flex items-center justify-between text-sm">
          <Link href={`/bilan/${anneePrec}`} className="text-text-muted hover:text-text transition-colors">
            ← {anneePrec}
          </Link>
          <span className="font-semibold text-text">{anneeNum}</span>
          {anneeNum < maintenant && (
            <Link href={`/bilan/${anneeSuiv}`} className="text-text-muted hover:text-text transition-colors">
              {anneeSuiv} →
            </Link>
          )}
          {anneeNum >= maintenant && <span />}
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Souvenirs', value: totalSouvenirs, emoji: '♡' },
            { label: 'Photos',    value: totalPhotos,    emoji: '📷' },
            { label: 'Vidéos',    value: totalVideos,    emoji: '🎬' },
            { label: 'Jours ensemble', value: joursEnsemble, emoji: '🗓' },
          ].map(({ label, value, emoji }) => (
            <Card key={label} className="text-center space-y-1">
              <span className="text-2xl">{emoji}</span>
              <p className="text-2xl font-bold text-text">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </Card>
          ))}
        </div>

        {/* Graphique des mois */}
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-text">Activité par mois</p>
          <div className="flex items-end gap-1 h-24">
            {parMois.map(({ mois, count }) => {
              const hauteur = moisMax.count > 0 ? Math.max(8, Math.round((count / moisMax.count) * 100)) : 8
              return (
                <Link key={mois} href={`/bilan/${anneeNum}/${mois}`} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full rounded-t-md bg-primary/20 group-hover:bg-primary/50 transition-colors"
                    style={{ height: `${hauteur}%` }}
                  />
                  <span className="text-[9px] text-text-muted">{NOMS_MOIS[mois - 1]}</span>
                </Link>
              )
            })}
          </div>
        </Card>

        {/* Moments forts */}
        <div className="grid grid-cols-2 gap-3">
          {moisMax.count > 0 && (
            <Card className="space-y-1">
              <p className="text-xs text-text-muted">Mois le plus actif</p>
              <p className="text-lg font-bold text-text capitalize">
                {format(new Date(anneeNum, moisMax.mois - 1, 1), 'MMMM', { locale: fr })}
              </p>
              <p className="text-sm text-primary">{moisMax.count} souvenir{moisMax.count > 1 ? 's' : ''}</p>
            </Card>
          )}
          {typeMax && (
            <Card className="space-y-1">
              <p className="text-xs text-text-muted">Type favori</p>
              <p className="text-lg font-bold text-text">
                {EMOJIS_TYPE[typeMax[0]] ?? '♡'} {typeMax[0]}
              </p>
              <p className="text-sm text-primary">{typeMax[1]} fois</p>
            </Card>
          )}
        </div>

        {/* Lieux */}
        {lieux.length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-text">
              📍 Lieux visités ({lieux.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {lieux.map((lieu) => (
                <span key={lieu} className="px-3 py-1 bg-surface-raised rounded-full text-sm text-text-soft">
                  {lieu}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Bilans mensuels */}
        <Card className="space-y-2">
          <p className="text-sm font-semibold text-text">Bilans mensuels</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {parMois.filter(m => m.count > 0).map(({ mois, count }) => (
              <Link
                key={mois}
                href={`/bilan/${anneeNum}/${mois}`}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-surface-raised transition-colors text-center"
              >
                <span className="text-sm font-medium text-text">{NOMS_MOIS[mois - 1]}</span>
                <span className="text-xs text-primary">{count} souvenir{count > 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Bouton impression */}
        <BoutonImprimer
          label="Imprimer / Sauvegarder en PDF"
          className="w-full py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors print:hidden"
        />
      </div>
    </>
  )
}
