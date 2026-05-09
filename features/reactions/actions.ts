'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ReactionType } from '@/types/database.types'

export async function toggleReaction(memoryId: string, type: ReactionType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existante } = await supabase
    .from('reactions')
    .select('id')
    .eq('memory_id', memoryId)
    .eq('user_id', user.id)
    .eq('type', type)
    .single()

  if (existante) {
    await supabase.from('reactions').delete().eq('id', existante.id)
  } else {
    await supabase.from('reactions').insert({ memory_id: memoryId, user_id: user.id, type })
  }

  revalidatePath(`/souvenirs/${memoryId}`)
}
