import { DemoIndisponible } from '@/components/shared/demo-indisponible'
import { DEMO_MEMORIES } from '@/lib/demo-data'

export function generateStaticParams() {
  return DEMO_MEMORIES.map((m) => ({ id: m.id }))
}

export default function ModifierSouvenirPage() {
  return <DemoIndisponible titre="Modifier le souvenir" description="La modification de souvenirs est disponible dans la version complète." />
}
