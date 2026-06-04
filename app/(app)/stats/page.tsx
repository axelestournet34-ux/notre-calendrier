import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'

const EMOJIS_TYPE: Record<string, string> = {
  sortie:'🎉', voyage:'✈️', repas:'🍽', anniversaire:'🎂',
  quotidien:'☀️', premiere_fois:'⭐', autre:'♡',
}
const LABELS_TYPE: Record<string, string> = {
  sortie:'Sortie', voyage:'Voyage', repas:'Repas', anniversaire:'Anniversaire',
  quotidien:'Quotidien', premiere_fois:'Première fois', autre:'Autre',
}
const NOMS_MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id, couples(name, start_date)')
    .eq('user_id', user.id)
    .single() as {
      data: { couple_id: string; couples: { name: string; start_date: string | null } } | null
    }
  if (!memberRow) redirect('/onboarding')

  const { data: souvenirs } = await supabase
    .from('memories')
    .select('id, date, title, type, lieu, memory_photos(id, media_type)')
    .eq('couple_id', memberRow.couple_id)
    .order('date', { ascending: true }) as {
      data: { id: string; date: string; title: string; type: string; lieu: string | null; memory_photos: { id: string; media_type: string }[] }[] | null
    }

  const liste = souvenirs ?? []
  const now = new Date()

  // Totaux
  const totalSouvenirs = liste.length
  const totalPhotos = liste.reduce((a, s) => a + s.memory_photos.filter(p => p.media_type === 'photo').length, 0)
  const totalVideos = liste.reduce((a, s) => a + s.memory_photos.filter(p => p.media_type === 'video').length, 0)
  const totalAudios = liste.reduce((a, s) => a + s.memory_photos.filter(p => p.media_type === 'audio').length, 0)

  // Premier et dernier souvenir
  const premierSouvenir = liste[0] ?? null
  const dernierSouvenir = liste[liste.length - 1] ?? null

  // Jours ensemble
  const joursEnsemble = memberRow.couples.start_date
    ? Math.floor((now.getTime() - new Date(memberRow.couples.start_date).getTime()) / 86400000)
    : null

  // Meilleur mois de l'historique
  const parMoisCle: Record<string, number> = {}
  liste.forEach(s => {
    const cle = s.date.slice(0, 7) // YYYY-MM
    parMoisCle[cle] = (parMoisCle[cle] ?? 0) + 1
  })
  const meilleurMois = Object.entries(parMoisCle).sort((a, b) => b[1] - a[1])[0]

  // Type favori
  const parType: Record<string, number> = {}
  liste.forEach(s => { parType[s.type] = (parType[s.type] ?? 0) + 1 })
  const typeFavori = Object.entries(parType).sort((a, b) => b[1] - a[1])

  // Lieux
  const tousLieux = liste.map(s => s.lieu).filter(Boolean) as string[]
  const parLieu: Record<string, number> = {}
  tousLieux.forEach(l => { parLieu[l] = (parLieu[l] ?? 0) + 1 })
  const lieuxTries = Object.entries(parLieu).sort((a, b) => b[1] - a[1])

  // Activité par mois (12 derniers)
  const barres = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const cle = format(d, 'yyyy-MM')
    return { label: NOMS_MOIS[d.getMonth()], count: parMoisCle[cle] ?? 0 }
  })
  const barreMax = Math.max(...barres.map(b => b.count), 1)

  // Moyenne mensuelle
  const nbMoisActifs = Object.keys(parMoisCle).length
  const moyenneMensuelle = nbMoisActifs > 0 ? (totalSouvenirs / nbMoisActifs).toFixed(1) : '0'

  return (
    <>
      <Header title="Nos stats" subtitle={memberRow.couples.name} />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-6">

        {/* Totaux */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '♡',  label: 'Souvenirs',       value: totalSouvenirs },
            { emoji: '📷', label: 'Photos',           value: totalPhotos },
            { emoji: '🎬', label: 'Vidéos',           value: totalVideos },
            { emoji: '🎙', label: 'Notes vocales',    value: totalAudios },
          ].map(({ emoji, label, value }) => (
            <Card key={label} className="text-center space-y-1">
              <span className="text-2xl">{emoji}</span>
              <p className="text-2xl font-bold text-text">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </Card>
          ))}
        </div>

        {/* Activité 12 derniers mois */}
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-text">Activité (12 derniers mois)</p>
          <div className="flex items-end gap-1 h-20">
            {barres.map(({ label, count }, i) => {
              const h = Math.max(8, Math.round((count / barreMax) * 100))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-primary/25 hover:bg-primary/50 transition-colors"
                    style={{ height: `${h}%` }}
                    title={`${count} souvenir${count > 1 ? 's' : ''}`}
                  />
                  <span className="text-[9px] text-text-muted">{label}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Records & moments forts */}
        <div className="grid grid-cols-2 gap-3">
          {joursEnsemble !== null && (
            <Card className="space-y-1">
              <p className="text-xs text-text-muted">Jours ensemble</p>
              <p className="text-3xl font-bold text-primary">{joursEnsemble}</p>
              <p className="text-xs text-text-muted">depuis le début</p>
            </Card>
          )}
          <Card className="space-y-1">
            <p className="text-xs text-text-muted">Moyenne / mois</p>
            <p className="text-3xl font-bold text-primary">{moyenneMensuelle}</p>
            <p className="text-xs text-text-muted">souvenirs</p>
          </Card>
          {meilleurMois && (
            <Card className="space-y-1">
              <p className="text-xs text-text-muted">Meilleur mois</p>
              <p className="text-lg font-bold text-text capitalize">
                {format(parseISO(`${meilleurMois[0]}-01`), 'MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-xs text-primary">{meilleurMois[1]} souvenirs</p>
            </Card>
          )}
          {premierSouvenir && (
            <Card className="space-y-1">
              <p className="text-xs text-text-muted">Premier souvenir</p>
              <p className="text-sm font-semibold text-text truncate">{premierSouvenir.title}</p>
              <p className="text-xs text-primary">
                {format(parseISO(premierSouvenir.date), 'd MMM yyyy', { locale: fr })}
              </p>
            </Card>
          )}
        </div>

        {/* Types */}
        {typeFavori.length > 0 && (
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-text">Répartition par type</p>
            <div className="space-y-2">
              {typeFavori.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-6 text-center text-base">{EMOJIS_TYPE[type] ?? '♡'}</span>
                  <span className="text-xs text-text-soft w-24 shrink-0">{LABELS_TYPE[type] ?? type}</span>
                  <div className="flex-1 bg-surface-raised rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / totalSouvenirs) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top lieux */}
        {lieuxTries.length > 0 && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">📍 Top lieux</p>
              <Link href="/lieux" className="text-xs text-primary hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-2">
              {lieuxTries.slice(0, 5).map(([lieu, count], i) => (
                <div key={lieu} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                  <span className="flex-1 text-sm text-text truncate">{lieu}</span>
                  <span className="text-xs text-text-muted shrink-0">{count}×</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {totalSouvenirs === 0 && (
          <Card className="text-center py-14 text-text-muted text-sm">
            Aucun souvenir encore. Commencez à créer votre histoire !
          </Card>
        )}
      </div>
    </>
  )
}
