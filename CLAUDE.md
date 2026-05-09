# CLAUDE.md – Notre Calendrier

Ce fichier donne le contexte permanent à Claude pour le projet **Notre Calendrier** : une application web moderne et premium pour un couple, avec calendrier, souvenirs, photos, et vue visuelle par mois.

---

## 1. Mission du projet

- App web privée pour **un couple seulement** (moi + ma copine Fanny).
- Partager un **calendrier de souvenirs** enrichi de photos, notes et légendes.
- Permettre à nous deux d’ajouter des photos facilement à tout moment.
- Chaque mois doit avoir une **identité visuelle forte** (couverture, mosaïque, résumé).
- UX **premium, romantique, moderne, propre**, pas scolaire ni brouillon.

---

## 2. Stack principale

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (auth, base PostgreSQL, storage, RLS)
- React Hook Form + Zod
- date-fns
- Micro‑animations discrètes

---

## 3. Structure de base du projet

Arborescence principale attendue :

- /app
- /components
- /components/ui
- /features
- /lib
- /hooks
- /services
- /supabase
- /types
- /utils
- /styles

---

## 4. Règles de code (non négociables)

- Toujours **TypeScript strict**.
- Code **lisible, propre, modulaire**, pas de gros fichiers.
- 1 composant = 1 fichier, pas de monolithe.
- Séparation claire UI / logique / données.
- Nom de classes et variables en **français lisible** ou anglais clair.
- Tous les textes d’interface en **français**.
- Responsive mobile‑first, propre aussi sur desktop.
- Mode **clair / sombre** supporté.
- Bonnes pratiques tailwind, pas de style en ligne.

---

## 5. Règles de sécurité et données

- L’application est **privée à un couple**.
- Chaque utilisateur ne voit que **les données de son propre couple**.
- Utiliser **Supabase RLS** pour sécuriser les permissions.
- Ne jamais exposer de données sensibles côté client.
- Valider toutes les entrées utilisateur (Zod + côté serveur).
- Ne pas créer de fonctionnalités qui exposeraient les données à d’autres utilisateurs.

---

## 6. Bonnes pratiques UX / UI

- Design **moderne, romantique, ni trop kitsch ni trop froid**.
- Espaces, typographie et couleurs bien pensés.
- Micro‑animations fines, pas de fioritures.
- Chargement, états vides, erreurs, skeletons, toasts bien gérés.
- Privilégier une expérience fluide sur mobile, car nous utiliserons souvent le téléphone.

---

## 7. Workflow de travail avec Claude

- Claude doit d’abord **proposer un plan** avant d’écrire beaucoup de code.
- Si le projet est gros, **diviser en phases** (Phase 1, 2, 3…).
- Commencer par :
  - arborescence du projet,
  - Schéma Supabase,
  - pages principales,
  - puis ajouter le reste.
- Toujours **verifier que le code est exécutable** et non juste théorique.
- Si Claude ajoute du code, il doit le **colle sous forme de fichiers structurés**, pas en blocs de texte sans contexte.

---

## 8. Commandes / pratiques que je préfère

- Mettre les fichiers principaux clairement nommés.
- Utiliser des noms de dossiers parlants.
- Garder un README complet.
- Utiliser un `.env.example` bien documenté.
- Ne pas supprimer ou réécrire bêtement des fichiers critiques (auth, schéma, drivers).
- Si tu dois refaire une partie, **préviens‑moi** et propose une version propre.