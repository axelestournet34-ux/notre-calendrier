import { redirect } from 'next/navigation'

export default function BilanIndex() {
  redirect(`/bilan/${new Date().getFullYear()}`)
}
