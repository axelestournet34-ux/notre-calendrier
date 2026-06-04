import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'

const JEUX = [
  {
    href: '/quiz',
    emoji: '🎴',
    titre: 'Quiz souvenirs',
    description: 'Reconnaissez-vous vos souvenirs rien qu\'à la photo ?',
    couleur: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20',
  },
  {
    href: '/jeux/quel-mois',
    emoji: '📅',
    titre: 'Quel mois était-ce ?',
    description: 'Retrouvez en quel mois se sont passés vos souvenirs.',
    couleur: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
  },
  {
    href: '/jeux/photo-mystere',
    emoji: '🔍',
    titre: 'Photo mystère',
    description: 'La photo se révèle peu à peu — devinez avant qu\'il soit trop tard !',
    couleur: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
  },
]

export default function JeuxPage() {
  return (
    <>
      <Header title="Jeux" subtitle="Testez votre mémoire à deux" />

      <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto w-full space-y-4">
        <p className="text-sm text-text-muted">
          Tous les jeux utilisent vos vrais souvenirs.
        </p>

        <div className="space-y-3">
          {JEUX.map(({ href, emoji, titre, description, couleur }) => (
            <Link key={href} href={href}>
              <Card
                hover
                className={`bg-gradient-to-br ${couleur} border-none flex items-center gap-4`}
              >
                <div className="text-4xl shrink-0">{emoji}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-text">{titre}</p>
                  <p className="text-sm text-text-soft mt-0.5">{description}</p>
                </div>
                <span className="text-text-muted shrink-0 ml-auto">→</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
