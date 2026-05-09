import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getR2Url } from '@/lib/r2'
import { Header } from '@/components/layout/header'
import { AlbumClient } from '@/features/mots-amour/album-client'

export default async function MotsAmourPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  // Les deux membres du couple
  const { data: membres } = await supabase
    .from('couple_members')
    .select('user_id, profiles(full_name)')
    .eq('couple_id', memberRow.couple_id) as {
      data: { user_id: string; profiles: { full_name: string | null } }[] | null
    }

  const moi = membres?.find(m => m.user_id === user.id)
  const partenaire = membres?.find(m => m.user_id !== user.id)

  const prenomMoi = moi?.profiles?.full_name?.split(' ')[0] ?? 'Moi'
  const prenomPartenaire = partenaire?.profiles?.full_name?.split(' ')[0] ?? 'Mon amour'

  // Mots du couple
  type MotRow = {
    id: string; content: string; created_at: string; author_id: string
    mots_amour_photos: { id: string; storage_path: string; sort_order: number }[]
  }
  const { data: tousLesMots } = await supabase
    .from('mots_amour')
    .select('id, content, created_at, author_id, mots_amour_photos(id, storage_path, sort_order)')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: false }) as { data: MotRow[] | null }

  const motsMoi        = (tousLesMots ?? []).filter(m => m.author_id === user.id)
  const motsPartenaire = (tousLesMots ?? []).filter(m => m.author_id !== user.id)

  // URLs signées
  async function signerMots(mots: MotRow[]) {
    return Promise.all(mots.map(async mot => ({
      ...mot,
      photos: await Promise.all(
        mot.mots_amour_photos
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(async p => {
            const url = await getR2Url(p.storage_path).catch(() => null)
            return { id: p.id, url }
          })
      ),
    })))
  }

  const [motsMoiSigne, motsPartenaireSigne] = await Promise.all([
    signerMots(motsMoi),
    signerMots(motsPartenaire),
  ])

  return (
    <>
      <Header
        title="Mots d'amour"
        subtitle="Notre album de petits mots"
      />

      <div className="px-4 lg:px-6 py-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Album de mes mots pour le/la partenaire */}
          <AlbumClient
            mots={motsMoiSigne}
            estMon={true}
            titrePour={`Pour ${prenomPartenaire}`}
            couleur="rose"
          />

          {/* Album des mots du/de la partenaire pour moi */}
          <AlbumClient
            mots={motsPartenaireSigne}
            estMon={false}
            titrePour={`De ${prenomPartenaire} pour moi`}
            couleur="lavande"
          />

        </div>
      </div>
    </>
  )
}
