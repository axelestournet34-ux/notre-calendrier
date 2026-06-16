import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { BoutonImprimer } from '@/components/shared/bouton-imprimer'

interface Props { searchParams: Promise<{ annee?: string; mois?: string }> }

export default async function AlbumPage({ searchParams }: Props) {
  const { annee, mois } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, couples(name)')
    .eq('user_id', user.id)
    .single() as { data: { couple_id: string; couples: { name: string } } | null }
  if (!memberRow) redirect('/onboarding')

  const now = new Date()
  const anneeNum = Number(annee) || now.getFullYear()
  const moisNum = Math.min(12, Math.max(1, Number(mois) || now.getMonth() + 1))

  const mm = String(moisNum).padStart(2, '0')
  const debut = `${anneeNum}-${mm}-01`
  const dernierJour = new Date(anneeNum, moisNum, 0).getDate()
  const fin = `${anneeNum}-${mm}-${String(dernierJour).padStart(2, '0')}`

  type Row = {
    id: string; date: string; title: string; note: string | null; lieu: string | null; citation: string | null
    memory_photos: { storage_path: string; media_type: string; caption: string | null; sort_order: number }[]
  }
  const { data: souvenirs } = await supabase
    .from('memories')
    .select('id, date, title, note, lieu, citation, memory_photos(storage_path, media_type, caption, sort_order)')
    .eq('couple_id', memberRow.couple_id)
    .gte('date', debut).lte('date', fin)
    .order('date') as { data: Row[] | null }

  // Résolution des URLs photos (on n'imprime que les photos)
  const album = await Promise.all(
    (souvenirs ?? []).map(async (s) => ({
      ...s,
      photos: await Promise.all(
        s.memory_photos
          .filter((p) => p.media_type === 'photo')
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(async (p) => ({ caption: p.caption, url: await getR2Url(p.storage_path).catch(() => null) }))
      ),
    }))
  )

  const moisLabel = format(new Date(anneeNum, moisNum - 1, 1), 'MMMM yyyy', { locale: fr })
  const moisPrec = moisNum === 1 ? { a: anneeNum - 1, m: 12 } : { a: anneeNum, m: moisNum - 1 }
  const moisSuiv = moisNum === 12 ? { a: anneeNum + 1, m: 1 } : { a: anneeNum, m: moisNum + 1 }
  const futur = anneeNum > now.getFullYear() || (anneeNum === now.getFullYear() && moisNum >= now.getMonth() + 1)

  return (
    <>
      {/* Barre écran — masquée à l'impression */}
      <div
        data-print-hidden
        className="sticky top-0 z-40 bg-bg/80 backdrop-blur border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Link href={`/album?annee=${moisPrec.a}&mois=${moisPrec.m}`} className="text-text-muted hover:text-text p-1.5"><ChevronLeft size={18} /></Link>
          <span className="text-sm font-semibold text-text capitalize">{moisLabel}</span>
          {!futur ? (
            <Link href={`/album?annee=${moisSuiv.a}&mois=${moisSuiv.m}`} className="text-text-muted hover:text-text p-1.5"><ChevronRight size={18} /></Link>
          ) : <span className="w-8" />}
        </div>
        <BoutonImprimer
          label="Imprimer / PDF"
          className="h-9 px-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        />
      </div>

      <div className="px-4 lg:px-6 py-8 max-w-3xl mx-auto w-full">
        {/* Couverture */}
        <div className="text-center mb-10 break-inside-avoid">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Notre album</p>
          <h1 className="text-3xl font-bold text-text mt-2 capitalize">{moisLabel}</h1>
          <p className="text-sm text-text-muted mt-1">{memberRow.couples.name}</p>
        </div>

        {album.length === 0 ? (
          <p data-print-hidden className="text-sm text-text-muted text-center py-16">
            Aucun souvenir ce mois-ci. Choisis un autre mois ci-dessus.
          </p>
        ) : (
          <div className="space-y-10">
            {album.map((s) => (
              <article key={s.id} className="break-inside-avoid space-y-3">
                <div className="border-b border-border pb-2">
                  <h2 className="text-lg font-semibold text-text">{s.title}</h2>
                  <p className="text-xs text-text-muted">
                    {format(new Date(s.date), 'EEEE d MMMM', { locale: fr })}
                    {s.lieu ? ` · ${s.lieu}` : ''}
                  </p>
                </div>
                {s.note && <p className="text-sm text-text-soft whitespace-pre-wrap">{s.note}</p>}
                {s.citation && <blockquote className="border-l-2 border-primary pl-3 italic text-sm text-text-soft">« {s.citation} »</blockquote>}
                {s.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {s.photos.map((p, i) =>
                      p.url ? (
                        <figure key={i} className="break-inside-avoid">
                          <img src={p.url} alt={p.caption ?? s.title} className="w-full rounded-lg object-cover" />
                          {p.caption && <figcaption className="text-xs text-text-muted mt-1">{p.caption}</figcaption>}
                        </figure>
                      ) : null
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
