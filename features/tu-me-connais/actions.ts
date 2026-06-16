'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { notifierPartenaire } from '@/features/notifications/notifier'

const schema = z.object({
  question: z.string().min(1, 'Question requise').max(300),
  correct:  z.string().min(1, 'Bonne réponse requise').max(120),
  decoys:   z.array(z.string().max(120)).min(1, 'Au moins une mauvaise réponse'),
})

function melanger<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

export async function creerQuestionTMC(_: unknown, formData: FormData) {
  const decoys = [formData.get('decoy1'), formData.get('decoy2'), formData.get('decoy3')]
    .map((d) => (typeof d === 'string' ? d.trim() : ''))
    .filter(Boolean)

  const donnees = schema.safeParse({
    question: formData.get('question'),
    correct: (formData.get('correct') as string | null)?.trim(),
    decoys,
  })
  if (!donnees.success) return { error: donnees.error.issues[0]?.message ?? 'Données invalides.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) return { error: 'Couple introuvable.' }

  // Mélange des options et repérage de la bonne réponse
  const correct = donnees.data.correct
  const options = melanger([correct, ...donnees.data.decoys])
  const correctIndex = options.indexOf(correct)

  const { error } = await supabase.from('tmc_questions').insert({
    couple_id: memberRow.couple_id,
    author_id: user.id,
    question: donnees.data.question,
    options,
    correct_index: correctIndex,
  })
  if (error) return { error: 'Erreur lors de la création.' }

  await notifierPartenaire({
    coupleId: memberRow.couple_id,
    type: 'tmc_question',
    detail: donnees.data.question,
    link: '/jeux/tu-me-connais',
  })

  revalidatePath('/jeux/tu-me-connais')
  return { success: true }
}

export async function repondreQuestionTMC(questionId: string, chosenIndex: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' as const }

  const { data: q } = await supabase
    .from('tmc_questions').select('couple_id, correct_index').eq('id', questionId).single()
  if (!q) return { error: 'Question introuvable.' as const }

  const { error } = await supabase.from('tmc_answers').insert({
    question_id: questionId,
    user_id: user.id,
    chosen_index: chosenIndex,
  })
  if (error) return { error: 'Tu as déjà répondu.' as const }

  await notifierPartenaire({
    coupleId: q.couple_id,
    type: 'tmc_reponse',
    detail: chosenIndex === q.correct_index ? 'Bonne réponse ! ✅' : 'Réponse ratée 😅',
    link: '/jeux/tu-me-connais',
  })

  revalidatePath('/jeux/tu-me-connais')
  return { correct: chosenIndex === q.correct_index, correctIndex: q.correct_index }
}
