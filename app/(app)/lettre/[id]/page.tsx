import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { DEMO_LETTRES } from '@/lib/demo-data'

export function generateStaticParams() {
  return DEMO_LETTRES.map((l) => ({ id: l.id }))
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function LettrePage({ params }: Props) {
  const { id } = await params
  const lettre = DEMO_LETTRES.find((l) => l.id === id)
  if (!lettre) notFound()

  return (
    <>
      <Header title={lettre.title} subtitle={`Par ${lettre.author_name}`} />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-5">
        <Link href="/lettre"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={14} />
          Retour aux lettres
        </Link>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary-light flex items-center justify-center text-lg">💌</div>
            <p className="text-xs text-text-muted">
              {format(new Date(lettre.created_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <p className="text-sm text-text-soft whitespace-pre-wrap leading-relaxed font-serif">
            {lettre.content}
          </p>
        </Card>
      </div>
    </>
  )
}
