import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { DEMO_LETTRES } from '@/lib/demo-data'

export default function LettresPage() {
  return (
    <>
      <Header title="Lettres d'amour" subtitle="Vos mots les plus précieux" />
      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-3">
        {DEMO_LETTRES.map((lettre) => (
          <Link key={lettre.id} href={`/lettre/${lettre.id}`} className="block">
            <Card hover className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <Mail size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{lettre.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Par {lettre.author_name} · {format(new Date(lettre.created_at), 'd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-xs text-text-soft mt-1 line-clamp-2 italic">
                  {lettre.content.split('\n').find(l => l.trim()) ?? ''}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
