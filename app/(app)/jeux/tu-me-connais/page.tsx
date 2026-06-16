import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { TuMeConnaisClient } from './tu-me-connais-client'

export default async function TuMeConnaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()

  if (!memberRow) {
    return (
      <>
        <Header title="Tu me connais ?" subtitle="Le quiz de couple" />
        <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
          <p className="text-sm text-text-muted text-center py-10">
            Tu n&apos;appartiens pas encore à un couple.
          </p>
        </div>
      </>
    )
  }

  type QRow = {
    id: string; author_id: string; question: string
    options: string[]; correct_index: number; created_at: string
    profiles: { full_name: string | null } | null
  }
  const { data: questions } = await supabase
    .from('tmc_questions')
    .select('id, author_id, question, options, correct_index, created_at, profiles(full_name)')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: false }) as { data: QRow[] | null }

  const { data: answers } = await supabase
    .from('tmc_answers')
    .select('question_id, user_id, chosen_index')

  const qs = questions ?? []
  const reps = answers ?? []
  const monRep = (qid: string) => reps.find((a) => a.question_id === qid && a.user_id === user.id) ?? null
  const repPartenaire = (qid: string) => reps.find((a) => a.question_id === qid && a.user_id !== user.id) ?? null

  // À deviner : questions posées par l'autre, pas encore répondues par moi
  // (on n'envoie PAS correct_index pour ne pas dévoiler la réponse)
  const aDeviner = qs
    .filter((q) => q.author_id !== user.id && !monRep(q.id))
    .map((q) => ({
      id: q.id,
      question: q.question,
      prenomAuteur: q.profiles?.full_name?.split(' ')[0] ?? 'Ton/ta partenaire',
      options: q.options,
    }))

  // Mes défis : questions que j'ai posées
  const mesDefis = qs
    .filter((q) => q.author_id === user.id)
    .map((q) => {
      const rp = repPartenaire(q.id)
      return {
        id: q.id,
        question: q.question,
        bonneReponse: q.options[q.correct_index],
        repondu: !!rp,
        partenaireCorrect: rp ? rp.chosen_index === q.correct_index : null,
      }
    })

  // Historique : questions auxquelles j'ai répondu
  const historique = qs
    .filter((q) => q.author_id !== user.id && monRep(q.id))
    .map((q) => {
      const mr = monRep(q.id)!
      return {
        id: q.id,
        question: q.question,
        monChoix: q.options[mr.chosen_index],
        bonneReponse: q.options[q.correct_index],
        correct: mr.chosen_index === q.correct_index,
      }
    })

  // Score : bonnes réponses de chacun
  const moi = reps.filter((a) => {
    const q = qs.find((x) => x.id === a.question_id)
    return a.user_id === user.id && q && a.chosen_index === q.correct_index
  }).length
  const partenaire = reps.filter((a) => {
    const q = qs.find((x) => x.id === a.question_id)
    return a.user_id !== user.id && q && a.chosen_index === q.correct_index
  }).length

  return (
    <>
      <Header title="Tu me connais ?" subtitle="Le quiz de couple" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <TuMeConnaisClient
          aDeviner={aDeviner}
          mesDefis={mesDefis}
          historique={historique}
          score={{ moi, partenaire }}
        />
      </div>
    </>
  )
}
