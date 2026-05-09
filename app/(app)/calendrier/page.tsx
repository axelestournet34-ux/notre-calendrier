import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default function CalendrierIndex() {
  const now = new Date()
  redirect(`/calendrier/${format(now, 'yyyy')}/${format(now, 'M')}`)
}
