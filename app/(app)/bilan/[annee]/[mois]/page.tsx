import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { BoutonImprimer } from '@/components/shared/bouton-imprimer'

interface Props { params: Promise<{ annee: string; mois: string }> }

const EMOJIS_TYPE: Record<string, string> = {
  sortie:'🎉',voyage:'✈️',repas:'🍽',anniversaire:'🎂',
  quotidien:'☀️',premiere_fois:'⭐',autre:'♡',
}

export default async function BilanMensuelPage({ params }: Props) {
  const { annee, mois } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id, couples(name)').eq('user_id', user.id).single() as {
      data: { couple_id: string; couples: { name: string } } | null
    }
  if (!memberRow) redirect('/onboarding')

  const anneeNum = Number(annee)
  const moisNum = Number(mois)
  const dateActuelle = new Date(anneeNum, moisNum - 1, 1)
  const titre = format(dateActuelle, 'MMMM yyyy', { locale: fr })
  const debut = `${annee}-${String(moisNum).padStart(2, '0')}-01`
  const fin = format(new Date(anneeNum, moisNum, 0), 'yyyy-MM-dd')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('*, memory_photos(id, storage_path, media_type, sort_order), profiles(full_name)')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', debut)
    .lte('date', fin)
    .order('date') as { data: any[] | null }

  const liste = souvenirs ?? []
  const totalPhotos = liste.reduce((a: number, s: any) => a + s.memory_photos.filter((p: any) => p.media_type === 'photo').length, 0)
  const totalVideos = liste.reduce((a: number, s: any) => a + s.memory_photos.filter((p: any) => p.media_type === 'video').length, 0)

  const parType: Record<string, number> = {}
  liste.forEach((s: any) => { parType[s.type] = (parType[s.type] ?? 0) + 1 })
  const lieux = [...new Set(liste.map((s: any) => s.lieu).filter(Boolean))]

  // Photo couverture (première photo du mois)
  let coverUrl: string | null = null
  const premierePhotoPath = liste.flatMap((s: any) =>
    s.memory_photos.filter((p: any) => p.media_type === 'photo').sort((a: any, b: any) => a.sort_order - b.sort_order)
  )[0]?.storage_path

  if (premierePhotoPath) {
    coverUrl = await getR2Url(premierePhotoPath).catch(() => null)
  }

  const moisPrecedent = new Date(anneeNum, moisNum - 2, 1)
  const moisSuivant = new Date(anneeNum, moisNum, 1)

  return (
    <>
      <Header title={`Bilan · ${titre}`} subtitle={memberRow.couples.name} />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5 print:space-y-4">

        {/* Navigation */}
        <div className="flex items-center justify-between text-sm">
          <Link href={`/bilan/${format(moisPrecedent, 'yyyy')}/${format(moisPrecedent, 'M')}`}
            className="text-text-muted hover:text-text transition-colors">
            ← {format(moisPrecedent, 'MMM', { locale: fr })}
          </Link>
          <span className="font-semibold text-text capitalize">{titre}</span>
          <Link href={`/bilan/${format(moisSuivant, 'yyyy')}/${format(moisSuivant, 'M')}`}
            className="text-text-muted hover:text-text transition-colors">
            {format(moisSuivant, 'MMM', { locale: fr })} →
          </Link>
        </div>

        {/* Couverture */}
        {coverUrl && (
          <div className="aspect-video rounded-2xl overflow-hidden">
            <img src={coverUrl} alt={titre} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Souvenirs', value: liste.length, emoji: '♡' },
            { label: 'Photos',    value: totalPhotos,   emoji: '📷' },
            { label: 'Vidéos',    value: totalVideos,   emoji: '🎬' },
          ].map(({ label, value, emoji }) => (
            <Card key={label} className="text-center">
              <span className="text-xl">{emoji}</span>
              <p className="text-xl font-bold text-text mt-1">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </Card>
          ))}
        </div>

        {/* Types */}
        {Object.keys(parType).length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-text">Types de souvenirs</p>
            <div className="space-y-2">
              {Object.entries(parType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-6 text-center">{EMOJIS_TYPE[type] ?? '♡'}</span>
                  <div className="flex-1 bg-surface-raised rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(count / liste.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lieux */}
        {lieux.length > 0 && (
          <Card className="space-y-2">
            <p className="text-sm font-semibold text-text">📍 Lieux</p>
            <div className="flex flex-wrap gap-2">
              {lieux.map((lieu) => (
                <span key={String(lieu)} className="px-3 py-1 bg-surface-raised rounded-full text-sm text-text-soft">
                  {String(lieu)}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Liste souvenirs */}
        {liste.length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-text">Tous les souvenirs</p>
            <div className="space-y-2">
              {liste.map((s: any) => (
                <Link key={s.id} href={`/souvenirs/${s.id}`}
                  className="flex items-center gap-3 py-1.5 hover:opacity-75 transition-opacity">
                  <span>{EMOJIS_TYPE[s.type] ?? '♡'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{s.title}</p>
                    <p className="text-xs text-text-muted">
                      {format(parseISO(s.date), 'd MMM', { locale: fr })}
                      {s.lieu ? ` · ${s.lieu}` : ''}
                    </p>
                  </div>
                  {s.memory_photos.length > 0 && (
                    <span className="text-xs text-text-muted shrink-0">{s.memory_photos.length} 📷</span>
                  )}
                </Link>
              ))}
            </div>
          </Card>
        )}

        {liste.length === 0 && (
          <Card className="text-center py-10 text-text-muted text-sm">
            Aucun souvenir ce mois-ci.
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 print:hidden">
          <Link href={`/galerie/${annee}/${mois}`}
            className="flex-1 py-2 rounded-xl border border-border text-sm text-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors">
            Voir la galerie
          </Link>
          <BoutonImprimer
            label="Imprimer / PDF"
            className="flex-1 py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          />
        </div>
      </div>
    </>
  )
}
