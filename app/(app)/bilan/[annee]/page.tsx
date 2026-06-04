import { DemoIndisponible } from '@/components/shared/demo-indisponible'

export function generateStaticParams() {
  return [{ annee: '2024' }, { annee: '2025' }]
}

export default function BilanAnneePage() {
  return <DemoIndisponible titre="Bilan annuel" description="Le bilan annuel est disponible dans la version complète." />
}
