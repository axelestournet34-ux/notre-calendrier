import { createClient } from '@/lib/supabase/server'
import { envoyerPushAu } from '@/features/notifications/push'

export type NotificationType =
  | 'message_jour'
  | 'souvenir'
  | 'souvenir_modifie'
  | 'humeur'
  | 'lettre'
  | 'mot_amour'
  | 'commentaire'
  | 'reaction'
  | 'question'
  | 'tmc_question'
  | 'tmc_reponse'

interface NotifierParams {
  /** Couple concerné (sert à retrouver le partenaire). */
  coupleId: string
  type: NotificationType
  /** Contenu court affiché en sous-titre (titre du souvenir, extrait du message…). */
  detail?: string
  /** Lien ouvert au clic sur la notification. */
  link?: string
}

function titrePourType(type: NotificationType, prenom: string): string {
  switch (type) {
    case 'message_jour':     return `💌 ${prenom} t'a écrit un message du jour`
    case 'souvenir':         return `📸 ${prenom} a ajouté un souvenir`
    case 'souvenir_modifie': return `✏️ ${prenom} a modifié un souvenir`
    case 'humeur':           return `🌤️ ${prenom} a partagé son humeur`
    case 'lettre':           return `✉️ ${prenom} t'a écrit une lettre`
    case 'mot_amour':        return `💗 ${prenom} a déposé un mot d'amour`
    case 'commentaire':      return `💬 ${prenom} a commenté un souvenir`
    case 'reaction':         return `❤️ ${prenom} a réagi à un souvenir`
    case 'question':         return `💭 ${prenom} a répondu à la question du jour`
    case 'tmc_question':     return `🧠 ${prenom} te défie : « Tu me connais ? »`
    case 'tmc_reponse':      return `🧠 ${prenom} a répondu à ton défi`
  }
}

/**
 * Crée une notification pour le partenaire (l'autre membre du couple).
 * À appeler depuis une Server Action, après l'action réussie.
 * Ne lève jamais : une erreur de notification ne doit pas casser l'action.
 */
export async function notifierPartenaire({ coupleId, type, detail, link }: NotifierParams): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profil }, { data: membres }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('couple_members').select('user_id').eq('couple_id', coupleId),
    ])

    // Le partenaire = l'autre membre du couple (s'il existe déjà)
    const partenaire = membres?.find((m) => m.user_id !== user.id)
    if (!partenaire) return

    const prenom = profil?.full_name?.split(' ')[0] ?? 'Ton/ta partenaire'
    const titre = titrePourType(type, prenom)

    // 1. Notification in-app (cloche + temps réel)
    await supabase.from('notifications').insert({
      couple_id:    coupleId,
      recipient_id: partenaire.user_id,
      actor_id:     user.id,
      type,
      title:        titre,
      body:         detail ?? null,
      link:         link ?? null,
    })

    // 2. Notification push (téléphone, même app fermée)
    await envoyerPushAu(partenaire.user_id, {
      title: titre,
      body:  detail,
      url:   link,
      tag:   type,
    })
  } catch {
    // On ignore silencieusement : la notification est secondaire.
  }
}
