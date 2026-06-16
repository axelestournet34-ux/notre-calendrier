import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { WidgetAujourdhui } from '@/components/shared/widget-aujourdhui'
import { questionDuJour } from '@/features/questions/questions'
import type { MoodType } from '@/features/humeurs/actions'

export default async function AujourdhuiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single() as {
      data: { couple_id: string } | null
    }
  const coupleId = memberRow?.couple_id ?? null

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Messages du jour
  type MessageRow = { id: string; content: string; author_id: string; profiles: { full_name: string | null } }
  const { data: messages } = coupleId ? (await supabase
    .from('daily_messages')
    .select('id, content, author_id, profiles(full_name)')
    .eq('couple_id', coupleId)
    .eq('date', today)) as { data: MessageRow[] | null }
    : { data: [] as MessageRow[] }

  const monMessage = messages?.find((m) => m.author_id === user.id) ?? null
  const messagePartenaire = messages?.find((m) => m.author_id !== user.id) ?? null

  // Humeurs du jour
  type MoodRow = { user_id: string; mood: string; profiles: { full_name: string | null } }
  const { data: humeurs } = coupleId ? (await supabase
    .from('daily_moods')
    .select('user_id, mood, profiles(full_name)')
    .eq('couple_id', coupleId)
    .eq('date', today)) as { data: MoodRow[] | null }
    : { data: [] as MoodRow[] }

  const monHumeur = (humeurs?.find((h) => h.user_id === user.id)?.mood as MoodType) ?? null
  const humeurPartenairRow = humeurs?.find((h) => h.user_id !== user.id)
  const humeurPartenaire = humeurPartenairRow
    ? { mood: humeurPartenairRow.mood as MoodType, prenomUser: humeurPartenairRow.profiles?.full_name?.split(' ')[0] ?? 'Partenaire' }
    : null

  // Question du jour
  type ReponseRow = { user_id: string; answer: string; profiles: { full_name: string | null } }
  const { data: reponses } = coupleId ? (await supabase
    .from('daily_question_answers')
    .select('user_id, answer, profiles(full_name)')
    .eq('couple_id', coupleId)
    .eq('date', today)) as { data: ReponseRow[] | null }
    : { data: [] as ReponseRow[] }

  const maRepRow = reponses?.find((r) => r.user_id === user.id) ?? null
  const repPartenaireRow = reponses?.find((r) => r.user_id !== user.id) ?? null
  const question = {
    texte: questionDuJour(today),
    maReponse: maRepRow?.answer ?? null,
    // Révélée seulement si j'ai moi-même répondu
    reponsePartenaire: maRepRow && repPartenaireRow ? repPartenaireRow.answer : null,
    partenaireARepondu: !!repPartenaireRow,
    prenomPartenaire: repPartenaireRow?.profiles?.full_name?.split(' ')[0] ?? 'Ton/ta partenaire',
  }

  return (
    <>
      <Header
        title="Notre journée"
        subtitle={format(now, 'EEEE d MMMM yyyy', { locale: fr })}
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        {coupleId ? (
          <WidgetAujourdhui
            messagePartenaire={messagePartenaire ? {
              id: messagePartenaire.id,
              content: messagePartenaire.content,
              prenomAuteur: messagePartenaire.profiles?.full_name?.split(' ')[0] ?? 'Partenaire',
            } : null}
            monMessage={monMessage ? { id: monMessage.id, content: monMessage.content } : null}
            monHumeur={monHumeur}
            humeurPartenaire={humeurPartenaire}
            question={question}
          />
        ) : (
          <p className="text-sm text-text-muted text-center py-10">
            Crée ou rejoins ton couple pour partager ta journée.
          </p>
        )}
      </div>
    </>
  )
}
