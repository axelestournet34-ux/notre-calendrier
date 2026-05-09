# Notre Calendrier ♡

Application web privée pour couple — calendrier de souvenirs, photos, galerie mensuelle et bien plus.

---

## Fonctionnalités

| Section | Fonctionnalités |
|---|---|
| **Auth** | Inscription, connexion, déconnexion, gestion de session |
| **Couple** | Création de l'espace, invitation partenaire par lien, espace 100 % privé |
| **Dashboard** | Hero du mois, stats (jours ensemble, souvenirs, photos), raccourcis |
| **Calendrier** | Navigation mois par mois, jours avec souvenirs mis en surbrillance |
| **Souvenirs** | Ajout, modification, suppression, upload photos, types, notes |
| **Galerie** | Mosaïque mensuelle, lightbox, navigation entre photos |
| **Timeline** | Tous les souvenirs groupés par mois, ordre chronologique |
| **Bucket list** | Idées à réaliser ensemble, statuts (à faire / en cours / réalisé) |
| **Dates importantes** | Anniversaires, premières fois, événements récurrents, countdown |
| **Capsules temporelles** | Messages scellés, invisibles avant la date d'ouverture |
| **Paramètres** | Modifier profil, modifier couple, générer lien d'invitation |

---

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19** · **TypeScript strict**
- **Tailwind CSS v4** (variables CSS, mode clair/sombre)
- **Supabase** — Auth, PostgreSQL, Storage, RLS
- **Zod** — validation serveur
- **date-fns** — manipulation des dates
- **Lucide React** — icônes
- **Sonner** — toasts

---

## Démarrage rapide

### 1. Cloner et installer

```bash
git clone <repo>
cd notre-calendrier
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplissez `.env.local` avec vos clés Supabase :
- **Dashboard** → **Settings** → **API**
- Copiez `Project URL` et `anon / public key`

### 3. Base de données Supabase

Dans **SQL Editor** de votre projet Supabase, exécutez dans l'ordre :

```
supabase/schema.sql   → tables, types, triggers, index
supabase/rls.sql      → Row Level Security (sécurité par couple)
supabase/storage.sql  → buckets (memory-photos, monthly-covers, avatars)
```

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
```

---

## Flux d'utilisation

```
/inscription        →  créer un compte
/onboarding         →  nommer votre couple + date de début
/dashboard          →  accueil principal
/parametres/couple  →  générer le lien d'invitation pour votre partenaire
/invitation/[token] →  votre partenaire rejoint l'espace
```

---

## Structure du projet

```
app/
├── (auth)/               → connexion, inscription
├── (app)/                → pages protégées (layout avec sidebar)
│   ├── dashboard/
│   ├── calendrier/[annee]/[mois]/
│   ├── galerie/[annee]/[mois]/
│   ├── souvenirs/[id]/
│   ├── jour/[date]/
│   ├── timeline/
│   ├── bucket-list/
│   ├── dates-importantes/
│   ├── capsules/
│   └── parametres/profil|couple/
└── onboarding/           → création couple (hors layout app)

components/
├── ui/                   → Button, Card, Input
├── layout/               → Sidebar, Header, NavMobile
└── shared/               → composants réutilisables

features/                 → Server Actions + composants client par domaine
├── auth/
├── couple/
├── memories/
├── bucket-list/
├── dates-importantes/
├── capsules/
├── gallery/
└── parametres/

lib/supabase/
├── client.ts             → client navigateur
└── server.ts             → client serveur (cookies SSR)

supabase/
├── schema.sql            → schéma complet
├── rls.sql               → policies RLS
└── storage.sql           → buckets + policies Storage

types/
├── database.types.ts     → types générés Supabase
└── app.types.ts          → types métier
```

---

## Sécurité

- Toutes les tables protégées par **Row Level Security (RLS)**
- Chaque utilisateur ne voit que les données de **son couple**
- Photos dans des buckets **privés** avec URLs signées (1 h)
- Capsules temporelles **invisibles** avant leur date d'ouverture
- Validation **Zod** sur toutes les Server Actions

---

## Variables d'environnement

| Variable | Description | Requis |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL de l'app (liens d'invitation) | ✅ prod |

---

Fait avec ♡ pour Fanny.
