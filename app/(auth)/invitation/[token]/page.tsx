import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { accepterInvitation } from '@/features/couple/actions'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitationPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/connexion?redirect=/invitation/${token}`)
  }

  const result = await accepterInvitation(token)

  if (result?.error) {
    return (
      <div className="text-center space-y-4">
        <div className="size-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-3xl mx-auto">
          ✕
        </div>
        <h2 className="text-xl font-semibold text-text">Invitation invalide</h2>
        <p className="text-sm text-text-muted">{result.error}</p>
      </div>
    )
  }

  redirect('/dashboard')
}
