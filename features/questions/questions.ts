// Liste de questions "Question du jour" pour le couple.
// La question est choisie de façon déterministe selon la date : les deux
// partenaires ont donc la même question le même jour, sans rien stocker.

export const QUESTIONS: string[] = [
  'Quel est ton souvenir préféré de nous deux ?',
  'Si on pouvait repartir en voyage demain, ce serait où ?',
  "Qu'est-ce qui t'a fait craquer la première fois ?",
  'Quelle est ta petite manie chez moi que tu adores ?',
  "C'est quoi ton moment préféré de la journée avec moi ?",
  'Notre soirée parfaite ensemble, elle ressemblerait à quoi ?',
  'Quelle chanson te fait penser à nous ?',
  "Qu'est-ce que tu aimerais qu'on fasse plus souvent ?",
  'Quel a été ton plus beau fou rire avec moi ?',
  'Si tu devais me décrire en 3 mots, lesquels ?',
  "Qu'est-ce qui te rend le plus fier·e de nous ?",
  'Quel est ton rêve pour nous dans 5 ans ?',
  "Qu'est-ce que je fais qui te rend heureux·se sans que je le sache ?",
  'Quel plat te rappelle un moment avec moi ?',
  'La chose la plus folle que tu aimerais faire avec moi ?',
  "C'est quoi ton surnom préféré que je te donne ?",
  "Quel film on pourrait regarder 100 fois ensemble ?",
  "Qu'est-ce qui te manque le plus quand on est loin l'un de l'autre ?",
  'Ton souvenir le plus drôle de notre première année ?',
  'Si on adoptait un animal, ce serait quoi et quel nom ?',
  'Quelle saison te rappelle le plus notre histoire ?',
  "Qu'est-ce que tu admires le plus chez moi ?",
  'Quel petit geste du quotidien te touche le plus ?',
  "Quelle tradition rien qu'à nous tu aimerais créer ?",
  "C'est quoi le meilleur cadeau que je t'ai offert ?",
  'Quel endroit aimerais-tu qu\'on appelle « le nôtre » ?',
  'Si on écrivait un livre sur nous, quel serait le titre ?',
  "Qu'est-ce qui te fait te sentir le plus aimé·e ?",
  'Quel moment difficile nous a rendus plus forts ?',
  'Quelle est ta photo préférée de nous ?',
  "Qu'est-ce que tu as le plus hâte de vivre avec moi ?",
  'Quel défaut chez moi te fait sourire malgré tout ?',
  'Si on gagnait au loto, on ferait quoi en premier ensemble ?',
  "La chose la plus romantique qu'on ait faite ensemble ?",
  'Tu préfères : un câlin, un baiser ou tenir la main ?',
  'Quel souvenir aimerais-tu revivre exactement à l\'identique ?',
  'Qu\'est-ce qui te fait dire « j\'ai de la chance de l\'avoir » ?',
  'Quelle activité nouvelle aimerais-tu essayer à deux ?',
  "C'est quoi notre meilleure soirée canapé ?",
  'Quel pays rêves-tu de visiter avec moi ?',
  "Qu'est-ce que tu aimes le plus dans notre routine ?",
  'Quel mot résume le mieux notre amour ?',
  'Si tu ne devais garder qu\'un seul de nos souvenirs, lequel ?',
  "Qu'est-ce qui te rassure le plus chez moi ?",
  'Ta façon préférée qu\'on se dise « je t\'aime » ?',
  "Qu'est-ce qu'on devrait absolument faire avant la fin de l'année ?",
  "Quel moment t'a fait réaliser que tu m'aimais ?",
  'Quelle chanson tu mettrais pour danser avec moi dans le salon ?',
  "Qu'est-ce que tu trouves le plus mignon chez moi ?",
  "Une journée sans aucune obligation à deux : on ferait quoi ?",
]

/** Question du jour, déterministe selon la date 'yyyy-MM-dd'. */
export function questionDuJour(dateISO: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const jours = Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000)
  const index = ((jours % QUESTIONS.length) + QUESTIONS.length) % QUESTIONS.length
  return QUESTIONS[index]
}
