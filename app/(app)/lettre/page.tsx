import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function LettresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/onboarding')

  const { data: lettres } = await supabase
    .from('lettres')
    .select('id, title, content, created_at, author_id, profiles(full_name)')
    .eq('couple_id', memberRow.couple_id)
    .order('created_at', { ascending: false }) as {
      data: { id: string; title: string; content: string; created_at: string; author_id: string; profiles: { full_name: string | null } }[] | null
    }

  return (
    <>
      <Header
        title="Nos lettres"
        subtitle={`${lettres?.length ?? 0} lettre${(lettres?.length ?? 0) > 1 ? 's' : ''}`}
        actions={
          <Link href="/lettre/nouvelle">
            <Button icon={<Plus size={16} />} size="sm">Écrire</Button>
          </Link>
        }
      />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">

        {(!lettres || lettres.length === 0) && (
          <Card className="text-center py-14 space-y-4">
            <div className="size-14 rounded-full bg-primary-light flex items-center justify-center text-2xl mx-auto">💌</div>
            <div>
              <p className="text-sm font-medium text-text">Aucune lettre encore</p>
              <p className="text-xs text-text-muted mt-1">Écrivez votre première lettre d&apos;amour</p>
            </div>
            <Link href="/lettre/nouvelle">
              <Button variant="secondary" size="sm">Écrire une lettre</Button>
            </Link>
          </Card>
        )}

        {lettres?.map((lettre) => (
          <Link key={lettre.id} href={`/lettre/${lettre.id}`}>
            <Card hover className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-text truncate">{lettre.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {lettre.profiles?.full_name ?? 'Vous'} · {format(parseISO(lettre.created_at), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span className="text-xl shrink-0">💌</span>
              </div>
              <p className="text-sm text-text-soft line-clamp-2">{lettre.content}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
