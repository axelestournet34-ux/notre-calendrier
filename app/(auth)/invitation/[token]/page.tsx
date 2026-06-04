import { DemoIndisponible } from '@/components/shared/demo-indisponible'

export function generateStaticParams() {
  return [{ token: 'demo' }]
}

export default function InvitationPage() {
  return <DemoIndisponible titre="Invitation" description="Les invitations sont disponibles dans la version complète." />
}
