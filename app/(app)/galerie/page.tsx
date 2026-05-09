import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default function GalerieIndex() {
  const now = new Date()
  redirect(`/galerie/${format(now, 'yyyy')}/${format(now, 'M')}`)
}
