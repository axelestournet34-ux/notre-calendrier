// Photos via picsum.photos — ID fixe = image toujours identique
function pic(id: number) {
  return `https://picsum.photos/id/${id}/800/600`
}

export const DEMO_PROFILE = {
  id: 'demo', full_name: 'Thomas', avatar_url: null,
  created_at: '2023-02-14T00:00:00Z', updated_at: '2023-02-14T00:00:00Z',
}
export const DEMO_PARTNER = {
  id: 'demo2', full_name: 'Emma', avatar_url: null,
  created_at: '2023-02-14T00:00:00Z', updated_at: '2023-02-14T00:00:00Z',
}

export const DEMO_COUPLE = {
  id: 'demo-couple',
  name: 'Thomas & Emma ♡',
  start_date: '2023-02-14',
  cover_url: null,
  created_at: '2023-02-14T00:00:00Z', updated_at: '2023-02-14T00:00:00Z',
}

export type DemoMemory = {
  id: string; date: string; title: string
  note: string | null; type: string
  lieu: string | null; citation: string | null; chanson_url: string | null
  author_name: string
  photos: { id: string; url: string; caption: string | null; media_type: string }[]
}

export const DEMO_MEMORIES: DemoMemory[] = [
  {
    id: 'm1', date: '2023-02-14', title: 'Notre première rencontre ♡',
    type: 'premiere_fois', lieu: 'Paris, France',
    note: "Ce jour où nos regards se sont croisés pour la première fois dans ce petit café parisien. Le temps s'est arrêté. Je savais que tout allait changer.",
    citation: 'Certaines rencontres changent la vie à jamais',
    chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p1', url: pic(57), caption: 'Le café de notre rencontre', media_type: 'photo' },
      { id: 'p2', url: pic(26), caption: 'Notre premier selfie ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm2', date: '2023-04-08', title: 'Week-end à Barcelone',
    type: 'voyage', lieu: 'Barcelone, Espagne',
    note: "Trois jours incroyables à découvrir la Sagrada Familia, les Ramblas et la plage de Barceloneta. Le soleil catalan, les tapas et les rires... un voyage inoubliable.",
    citation: null, chanson_url: null, author_name: 'Emma',
    photos: [
      { id: 'p3', url: pic(37), caption: 'La Sagrada Familia', media_type: 'photo' },
      { id: 'p4', url: pic(58), caption: 'Coucher de soleil sur la plage', media_type: 'photo' },
      { id: 'p5', url: pic(75), caption: 'Tapas en terrasse ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm3', date: '2023-06-10', title: 'Concert de Clara Luciani',
    type: 'sortie', lieu: 'Olympia, Paris',
    note: "Une soirée magique à l'Olympia. La voix de Clara nous a transportés. On a dansé sur « Cœur » jusqu'à en perdre la voix.",
    citation: null,
    chanson_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    author_name: 'Thomas',
    photos: [
      { id: 'p6', url: pic(42), caption: "L'Olympia depuis nos places", media_type: 'photo' },
      { id: 'p7', url: pic(64), caption: 'Ambiance de folie ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm4', date: '2023-08-05', title: 'Vacances en Provence',
    type: 'voyage', lieu: 'Gordes, Provence',
    note: "Une semaine dans un mas provençal entouré de lavande et de cigales. Les marchés, les rosés frais, les balades dans le Luberon... la Provence c'est magique.",
    citation: null, chanson_url: null, author_name: 'Emma',
    photos: [
      { id: 'p8', url: pic(68), caption: 'Champs de lavande', media_type: 'photo' },
      { id: 'p9', url: pic(60), caption: 'Vue depuis Gordes', media_type: 'photo' },
      { id: 'p10', url: pic(33), caption: 'Notre terrasse le soir', media_type: 'photo' },
    ],
  },
  {
    id: 'm5', date: '2023-08-14', title: 'Nos 6 mois ensemble ♡',
    type: 'anniversaire', lieu: 'Paris, France',
    note: "Six mois déjà. On a fêté ça dans notre restaurant préféré. Le même menu, la même bougie sur la table, mais des yeux encore plus amoureux.",
    citation: 'Avec toi, chaque journée compte double', chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p11', url: pic(25), caption: 'Notre dîner anniversaire', media_type: 'photo' },
      { id: 'p12', url: pic(45), caption: 'Nos 6 mois ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm6', date: '2023-10-15', title: 'Week-end à Amsterdam',
    type: 'voyage', lieu: 'Amsterdam, Pays-Bas',
    note: "Les canaux en automne, les vélos, le musée Van Gogh et les stroopwafels chauds sur les marchés. Amsterdam nous a conquis. On reviendra.",
    citation: null, chanson_url: null, author_name: 'Emma',
    photos: [
      { id: 'p13', url: pic(13), caption: 'Les canaux au coucher du soleil', media_type: 'photo' },
      { id: 'p14', url: pic(46), caption: 'Vue depuis le Jordaan', media_type: 'photo' },
      { id: 'p15', url: pic(14), caption: 'Petit-déjeuner hollandais', media_type: 'photo' },
    ],
  },
  {
    id: 'm7', date: '2023-12-24', title: 'Réveillon de Noël ensemble',
    type: 'quotidien', lieu: 'Lyon, France',
    note: "Notre premier Noël en famille. Le sapin, les cadeaux, la fondue savoyarde... et ce moment parfait autour de la table quand tout le monde riait.",
    citation: null, chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p16', url: pic(63), caption: 'Le sapin de Noël', media_type: 'photo' },
      { id: 'p17', url: pic(65), caption: 'Toute la famille réunie ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm8', date: '2024-01-01', title: 'Bonne Année 2024 !',
    type: 'sortie', lieu: 'Paris, France',
    note: "Minuit sur les Champs-Élysées. Les feux d'artifice, la foule, et cette nouvelle année qui commence dans tes bras.",
    citation: "À toutes nos prochaines aventures", chanson_url: null, author_name: 'Emma',
    photos: [{ id: 'p18', url: pic(21), caption: "Feux d'artifice à Paris", media_type: 'photo' }],
  },
  {
    id: 'm9', date: '2024-02-14', title: 'Notre 1 an ♡',
    type: 'anniversaire', lieu: 'Paris, France',
    note: "Un an déjà. 365 jours de rires, de voyages, de bêtises et d'amour. Un album photo de toute notre première année. On a pleuré tous les deux. C'était parfait.",
    citation: "Un an ensemble, et j'en voudrais mille", chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p19', url: pic(49), caption: "Notre dîner d'anniversaire", media_type: 'photo' },
      { id: 'p20', url: pic(50), caption: "L'album photo offert ♡", media_type: 'photo' },
      { id: 'p21', url: pic(83), caption: 'Nos 365 jours ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm10', date: '2024-04-06', title: 'Randonnée à Chamonix',
    type: 'sortie', lieu: 'Chamonix, Haute-Savoie',
    note: "8 km de randonnée avec vue sur le Mont-Blanc. Pique-nique sur un rocher à 2000m d'altitude. Emma avait peur des vaches. C'était hilarant.",
    citation: null, chanson_url: null, author_name: 'Emma',
    photos: [
      { id: 'p22', url: pic(15), caption: 'Vue sur le Mont-Blanc', media_type: 'photo' },
      { id: 'p23', url: pic(30), caption: 'Notre pique-nique en altitude', media_type: 'photo' },
    ],
  },
  {
    id: 'm11', date: '2024-07-15', title: 'Vacances en Bretagne',
    type: 'voyage', lieu: 'Saint-Malo, Bretagne',
    note: "Une semaine à Saint-Malo entre les remparts, les crêpes au beurre salé et les grandes marées. On est tombés amoureux de la Bretagne.",
    citation: null, chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p24', url: pic(19), caption: 'Les remparts de Saint-Malo', media_type: 'photo' },
      { id: 'p25', url: pic(28), caption: 'Grande marée', media_type: 'photo' },
      { id: 'p26', url: pic(59), caption: 'Coucher de soleil sur la mer ♡', media_type: 'photo' },
    ],
  },
  {
    id: 'm12', date: '2024-09-01', title: 'Nos fiançailles à Venise ♡',
    type: 'premiere_fois', lieu: 'Venise, Italie',
    note: "Demandé en mariage sur le Pont des Soupirs, au coucher du soleil. Elle a dit oui. La gondole, le champagne, les larmes de joie... Ce soir-là, Venise était notre ville.",
    citation: "Oui, pour toujours et à jamais", chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p27', url: pic(22), caption: 'Le Pont des Soupirs', media_type: 'photo' },
      { id: 'p28', url: pic(85), caption: 'La bague ♡', media_type: 'photo' },
      { id: 'p29', url: pic(76), caption: 'Fiancés sur le Grand Canal', media_type: 'photo' },
    ],
  },
  {
    id: 'm13', date: '2024-11-08', title: 'Week-end spa & bien-être',
    type: 'sortie', lieu: 'Évian-les-Bains',
    note: "Un week-end de détente totale dans un hôtel spa au bord du lac Léman. Hammam, massages duo, dîner aux chandelles... on est repartis ressourcés.",
    citation: null, chanson_url: null, author_name: 'Emma',
    photos: [{ id: 'p30', url: pic(16), caption: 'Vue sur le lac Léman', media_type: 'photo' }],
  },
  {
    id: 'm14', date: '2024-12-25', title: 'Noël fiancés ♡',
    type: 'quotidien', lieu: 'Lyon, France',
    note: "Premier Noël fiancés ! La famille a découvert la bague. Larmes, câlins, champagne... Une soirée parfaite.",
    citation: null, chanson_url: null, author_name: 'Thomas',
    photos: [
      { id: 'p31', url: pic(38), caption: 'La bague présentée à la famille', media_type: 'photo' },
      { id: 'p32', url: pic(66), caption: 'Nos cadeaux au coin du feu', media_type: 'photo' },
    ],
  },
  {
    id: 'm15', date: '2025-02-14', title: 'Saint-Valentin — 2 ans ♡',
    type: 'anniversaire', lieu: 'Paris, France',
    note: "Deux ans d'amour. Un dîner avec vue sur la Tour Eiffel, une promenade sur les quais illuminés, et une lettre d'amour écrite à la main.",
    citation: "Deux ans ensemble, et ce n'est que le début", chanson_url: null, author_name: 'Emma',
    photos: [
      { id: 'p33', url: pic(74), caption: 'Dîner avec vue sur la Tour Eiffel', media_type: 'photo' },
      { id: 'p34', url: pic(87), caption: 'La lettre ♡', media_type: 'photo' },
    ],
  },
]

export type DemoBucketItem = {
  id: string; title: string; description: string | null
  status: 'a_faire' | 'en_cours' | 'realise'; planned_date: string | null
}

export const DEMO_BUCKET: DemoBucketItem[] = [
  { id: 'b1', title: 'Voir les aurores boréales en Islande', description: "Un rêve depuis toujours. Se blottir sous un ciel vert et violet, au milieu de la neige.", status: 'a_faire', planned_date: null },
  { id: 'b2', title: 'Apprendre à danser le tango', description: "On s'est inscrits à des cours — c'est difficile mais tellement fun !", status: 'en_cours', planned_date: null },
  { id: 'b3', title: 'Road trip sur la Côte Amalfitaine', description: "Louer une voiture décapotable et longer la côte italienne.", status: 'a_faire', planned_date: null },
  { id: 'b4', title: 'Cuisiner un repas gastronomique 3 plats', description: "Essayer de reproduire un menu de chef à la maison.", status: 'realise', planned_date: null },
  { id: 'b5', title: 'Week-end à Venise', description: "Demander Emma en mariage sur le Pont des Soupirs.", status: 'realise', planned_date: null },
  { id: 'b6', title: 'Faire un saut en parachute', description: "Sauter ensemble en tandem au-dessus des Alpes.", status: 'a_faire', planned_date: null },
  { id: 'b7', title: 'Passer une nuit dans une cabane dans les arbres', description: "Dans une forêt, avec une vue étoilée depuis le lit.", status: 'en_cours', planned_date: '2025-08-01' },
]

export type DemoImportantDate = {
  id: string; title: string; date: string
  type: string; recurrent: boolean; notes: string | null
}

export const DEMO_DATES: DemoImportantDate[] = [
  { id: 'd1', title: 'Notre rencontre ♡', date: '2023-02-14', type: 'premiere_rencontre', recurrent: true, notes: "Le jour où tout a commencé, dans ce petit café parisien." },
  { id: 'd2', title: "Anniversaire d'Emma", date: '1999-03-22', type: 'personnalise', recurrent: true, notes: "Penser à organiser quelque chose de spécial !" },
  { id: 'd3', title: 'Anniversaire de Thomas', date: '1998-11-08', type: 'personnalise', recurrent: true, notes: null },
  { id: 'd4', title: 'Nos fiançailles', date: '2024-09-01', type: 'anniversaire', recurrent: true, notes: "Le Pont des Soupirs, Venise. Le plus beau soir de ma vie." },
  { id: 'd5', title: 'Mariage prévu', date: '2026-09-05', type: 'personnalise', recurrent: false, notes: "Le grand jour !!" },
]

export type DemoCapsule = {
  id: string; title: string; content: string
  open_date: string; opened_at: string | null; author_name: string
}

export const DEMO_CAPSULES: DemoCapsule[] = [
  {
    id: 'c1', title: 'Pour notre mariage ♡', author_name: 'Thomas',
    content: "Ma Emma, si tu lis ces mots c'est que nous sommes à quelques jours du plus beau jour de nos vies. Je veux que tu saches que chaque matin à tes côtés est un cadeau. Tu es ma meilleure amie, mon amour, ma maison. J'ai hâte de te dire oui devant tout le monde. Je t'aime pour toujours.",
    open_date: '2026-09-01', opened_at: null,
  },
  {
    id: 'c2', title: 'Souvenir de nos fiançailles', author_name: 'Emma',
    content: "Thomas chéri, je viens de dire oui sur le Pont des Soupirs et je n'arrive pas à y croire. Mes mains tremblaient, mes yeux pleuraient, mon cœur débordait. Merci de m'avoir choisie. Je t'aime plus que les mots ne peuvent le dire.",
    open_date: '2025-09-01', opened_at: '2025-09-01T12:00:00Z',
  },
  {
    id: 'c3', title: 'Pour nos 5 ans ensemble', author_name: 'Thomas',
    content: "Bonne fête mes amours. 5 ans. Je me souviens encore de ce café, de ta robe, de ton sourire nerveux. Si seulement j'avais su que cette rencontre allait devenir toute ma vie...",
    open_date: '2028-02-14', opened_at: null,
  },
]

export type DemoLettre = {
  id: string; title: string; content: string
  author_name: string; created_at: string
}

export const DEMO_LETTRES: DemoLettre[] = [
  {
    id: 'l1', title: 'La plus belle rencontre de ma vie',
    author_name: 'Thomas', created_at: '2023-06-01T10:00:00Z',
    content: `Ma Emma,

Je t'écris ce soir parce que j'ai envie que tu saches, en dehors de nos conversations quotidiennes, à quel point ta présence dans ma vie a tout changé.

Avant toi, j'avais une belle vie. Mais je ne savais pas encore ce que signifiait vraiment partager quelque chose avec quelqu'un. Tu m'as appris ça. Tu m'as appris à rire pour rien, à pleurer des films qu'on avait déjà vus trois fois, à manger des crêpes à minuit parce que "pourquoi pas".

Tu es la personne la plus lumineuse que je connaisse. Dans les moments compliqués, tu trouves toujours le mot juste. Dans les moments heureux, tu les rends encore plus grands.

Je ne sais pas ce que l'avenir nous réserve, mais je sais que je veux le vivre avec toi.

Je t'aime,
Thomas ♡`,
  },
  {
    id: 'l2', title: "Ce que j'aime en toi",
    author_name: 'Emma', created_at: '2023-08-20T14:00:00Z',
    content: `Mon Thomas,

J'aime comment tu bois ton café du matin sans dire un mot pendant les dix premières minutes.
J'aime comment tu chantes faux dans la voiture en pensant que je n'entends pas.
J'aime ton sérieux quand tu cuisines quelque chose de nouveau, comme si c'était une affaire d'État.
J'aime tes mains quand elles tiennent les miennes.

J'aime que tu te souviens des petits détails — les fleurs que je préfère, la façon dont je veux mon thé, les films qui me font peur.

J'aime qu'avec toi, je n'ai jamais besoin de faire semblant.

Ce que j'aime le plus en toi, c'est que tu m'aimes telle que je suis. Complètement, maladresses comprises.

Je t'aime infiniment,
Emma ♡`,
  },
]
