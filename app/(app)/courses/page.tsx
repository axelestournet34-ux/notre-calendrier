import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { CoursesClient } from './courses-client'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) {
    return (
      <>
        <Header title="Liste de courses" subtitle="Votre liste partagée" />
        <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
          <p className="text-sm text-text-muted text-center py-10">
            Vous n'appartenez pas encore à un couple.
          </p>
        </div>
      </>
    )
  }

  type ArticleRow = { id: string; content: string; done: boolean; created_at: string }
  const { data: articles } = await supabase
    .from('liste_courses')
    .select('id, content, done, created_at')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: true }) as { data: ArticleRow[] | null }

  return (
    <>
      <Header title="Liste de courses" subtitle="Votre liste partagée" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full">
        <CoursesClient
          coupleId={memberRow.couple_id}
          articlesInitiaux={articles ?? []}
        />
      </div>
    </>
  )
}
