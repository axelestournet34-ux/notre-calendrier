import { DemoIndisponible } from '@/components/shared/demo-indisponible'

export function generateStaticParams() {
  return [
    { annee: '2024', mois: '12' },
    { annee: '2025', mois: '1' },
    { annee: '2025', mois: '6' },
  ]
}

export default function BilanMoisPage() {
  return <DemoIndisponible titre="Bilan mensuel" description="Le bilan mensuel est disponible dans la version complète." />
}
