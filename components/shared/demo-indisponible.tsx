import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'

interface Props {
  titre: string
  description?: string
}

export function DemoIndisponible({ titre, description }: Props) {
  return (
    <>
      <Header title={titre} />
      <div className="px-4 lg:px-6 py-16 max-w-md mx-auto w-full">
        <Card className="text-center space-y-4">
          <div className="size-14 rounded-2xl bg-surface-raised flex items-center justify-center mx-auto">
            <Lock size={24} className="text-text-muted" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text">Version démo</p>
            <p className="text-sm text-text-muted leading-relaxed">
              {description ?? "Cette fonctionnalité est disponible dans la version complète de l'application."}
            </p>
          </div>
          <Link href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
            ← Retour à l&apos;accueil
          </Link>
        </Card>
      </div>
    </>
  )
}
