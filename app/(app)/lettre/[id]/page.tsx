import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { BoutonImprimer } from '@/components/shared/bouton-imprimer'
import { supprimerLettre } from '@/features/lettres/actions'

interface Props { params: Promise<{ id: string }> }

export default async function LectureLetttrePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: lettre } = await supabase
    .from('lettres')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single() as {
      data: { id: string; couple_id: string; author_id: string; title: string; content: string; created_at: string; profiles: { full_name: string | null } } | null
    }

  if (!lettre) notFound()

  const { data: memberRow } = await supabase
    .from('couple_members').select('couple_id').eq('user_id', user.id).single()
  if (!memberRow || memberRow.couple_id !== lettre.couple_id) notFound()

  const estAuteur = lettre.author_id === user.id
  const date = format(parseISO(lettre.created_at), "d MMMM yyyy", { locale: fr })

  return (
    <>
      <Header
        title={lettre.title}
        subtitle={`${lettre.profiles?.full_name ?? 'Vous'} · ${date}`}
        actions={
          estAuteur ? (
            <form action={supprimerLettre.bind(null, id)}>
              <button type="submit"
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-medium text-text-soft hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
                Supprimer
              </button>
            </form>
          ) : null
        }
      />

      <div className="px-4 lg:px-6 py-8 max-w-xl mx-auto w-full">
        <Link href="/lettre" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-8">
          <ArrowLeft size={14} />
          Nos lettres
        </Link>

        <div className="bg-surface rounded-2xl border border-border shadow-sm p-8 space-y-6 print:shadow-none print:border-none">
          <div className="border-b border-border pb-4">
            <h1 className="text-2xl font-serif font-semibold text-text">{lettre.title}</h1>
            <p className="text-xs text-text-muted mt-1">{lettre.profiles?.full_name ?? 'Vous'} · {date}</p>
          </div>
          <div className="font-serif text-base text-text leading-8 whitespace-pre-wrap">
            {lettre.content}
          </div>
          <div className="pt-4 border-t border-border text-right">
            <p className="font-serif text-sm text-text-muted italic">
              Avec tout mon amour, {lettre.profiles?.full_name?.split(' ')[0] ?? 'Vous'} ♡
            </p>
          </div>
        </div>

        <div className="mt-6 print:hidden">
          <BoutonImprimer
            label="Imprimer / Sauvegarder en PDF"
            className="w-full py-2 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
          />
        </div>
      </div>
    </>
  )
}
