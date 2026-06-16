import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { envoyerPushAvecClient } from '@/features/notifications/push'
import { questionDuJour } from '@/features/questions/questions'

export const dynamic = 'force-dynamic'

// Notifications du matin (appelé une fois par jour par le cron Vercel).
// 1. Rappel « tu n'as pas répondu à la question du jour »
// 2. « Il y a un an aujourd'hui » (souvenirs du même jour l'an passé)
// 3. Rappels de dates importantes (J-7, J-3, J-1)
export async function GET(request: Request) {
  // Sécurité : Vercel envoie Authorization: Bearer ${CRON_SECRET}
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant' }, { status: 500 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const today = now.toISOString().split('T')[0] // yyyy-MM-dd (UTC)

  const { data: membres } = await admin.from('couple_members').select('couple_id, user_id')
  if (!membres?.length) return NextResponse.json({ ok: true, envois: 0 })

  // couple_id -> [user_id]
  const membresParCouple = new Map<string, string[]>()
  for (const m of membres) {
    const arr = membresParCouple.get(m.couple_id) ?? []
    arr.push(m.user_id)
    membresParCouple.set(m.couple_id, arr)
  }

  let envois = 0

  // ─── 1. Rappel question du jour ───
  const { data: reponses } = await admin
    .from('daily_question_answers').select('user_id').eq('date', today)
  const ontRepondu = new Set((reponses ?? []).map((r) => r.user_id))

  for (const m of membres) {
    if (!ontRepondu.has(m.user_id)) {
      await envoyerPushAvecClient(admin, m.user_id, {
        title: '💭 Question du jour',
        body: `Tu n'as pas encore répondu : « ${questionDuJour(today)} »`,
        url: '/aujourdhui',
        tag: 'question-rappel',
      })
      envois++
    }
  }

  // ─── 2. Il y a un an ───
  const ilYaUnAn = `${now.getUTCFullYear() - 1}-${today.slice(5)}`
  const { data: souvenirs1an } = await admin
    .from('memories').select('couple_id, title').eq('date', ilYaUnAn)

  const parCouple1an = new Map<string, string[]>()
  for (const s of souvenirs1an ?? []) {
    const arr = parCouple1an.get(s.couple_id) ?? []
    arr.push(s.title)
    parCouple1an.set(s.couple_id, arr)
  }
  for (const [coupleId, titres] of parCouple1an) {
    const body = titres.length > 1 ? `${titres[0]} (+${titres.length - 1} autre${titres.length > 2 ? 's' : ''})` : titres[0]
    for (const userId of membresParCouple.get(coupleId) ?? []) {
      await envoyerPushAvecClient(admin, userId, {
        title: '✨ Il y a un an aujourd\'hui',
        body,
        url: '/dashboard',
        tag: 'il-y-a-un-an',
      })
      envois++
    }
  }

  // ─── 3. Rappels de dates importantes (J-7, J-3, J-1) ───
  const { data: dates } = await admin
    .from('important_dates').select('couple_id, title, date, recurrent')

  const offsets = [7, 3, 1]
  for (const d of dates ?? []) {
    const [, m, day] = d.date.split('-').map(Number)
    let joursRestants: number | null = null
    for (const off of offsets) {
      const cible = new Date(now)
      cible.setUTCDate(cible.getUTCDate() + off)
      const memeJour = cible.getUTCMonth() + 1 === m && cible.getUTCDate() === day
      const memeDateComplete = cible.toISOString().split('T')[0] === d.date
      if ((d.recurrent && memeJour) || (!d.recurrent && memeDateComplete)) {
        joursRestants = off
        break
      }
    }
    if (joursRestants === null) continue

    const quand = joursRestants === 1 ? 'demain' : `dans ${joursRestants} jours`
    for (const userId of membresParCouple.get(d.couple_id) ?? []) {
      await envoyerPushAvecClient(admin, userId, {
        title: `📅 ${d.title}`,
        body: `C'est ${quand} !`,
        url: '/dates-importantes',
        tag: `date-${d.title}`,
      })
      envois++
    }
  }

  return NextResponse.json({ ok: true, envois })
}
