import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { data: memberRow } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) {
    return NextResponse.json({ error: 'Aucun couple trouvé' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('couple_invitations')
    .insert({ couple_id: memberRow.couple_id, invited_by: user.id })
    .select('token')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://notre-calendrier.vercel.app'
  const lien = `${baseUrl}/invitation/${data.token}`

  return NextResponse.json({ lien, expires: '7 jours' })
}
