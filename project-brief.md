Tu es un ingénieur logiciel senior spécialisé en Next.js, TypeScript, Supabase et architecture frontend/backend moderne.

Je veux que tu crées une application web premium, moderne, exécutable et maintenable, destinée à un couple.

Nom du produit :
Notre Calendrier

Vision produit :
Une application web privée pour couple, élégante et émotionnelle, qui combine :
- un calendrier mensuel interactif,
- des souvenirs avec photos,
- des légendes et notes,
- une galerie mensuelle,
- une timeline,
- des dates importantes,
- une bucket list de couple,
- des capsules temporelles,
- une activité récente,
- et une vraie UX premium.

Le produit doit ressembler à une vraie application lifestyle / journal de souvenirs premium, et non à un projet scolaire.

Stack obligatoire :
- Next.js récent avec App Router
- React
- TypeScript strict
- Tailwind CSS
- composants UI premium réutilisables
- Supabase pour auth, database, storage, RLS
- React Hook Form + Zod
- date-fns
- Framer Motion pour micro-animations
- architecture propre et scalable

Contraintes non négociables :
- code réellement exécutable
- pas une simple maquette
- tous les textes de l’interface en français
- responsive mobile-first + excellent rendu desktop
- mode clair / sombre
- design romantique, moderne, premium, pas kitsch
- séparation claire UI / logique / data
- composants réutilisables
- pas de fichiers géants
- pas de code brouillon
- README complet
- .env.example
- schéma SQL Supabase complet
- policies RLS complètes
- bonne structure de projet

Fonctionnalités obligatoires :
1. Authentification
- inscription email / mot de passe
- connexion
- déconnexion
- gestion de session
- profil utilisateur

2. Couple privé
- création du couple
- invitation partenaire
- liaison de deux utilisateurs dans un espace privé partagé
- chaque utilisateur ne voit que les données de son couple

3. Dashboard premium
- hero du mois
- résumé mensuel
- mini calendrier
- derniers souvenirs
- activité récente
- compteur de jours ensemble
- prochaine date importante
- raccourcis rapides

4. Calendrier mensuel
- navigation mois précédent / suivant
- jours avec souvenirs mis en surbrillance
- jour actuel distinct
- clic sur un jour pour voir le détail
- design premium

5. Souvenirs
- plusieurs souvenirs par jour
- plusieurs photos par souvenir
- légende
- note optionnelle
- type de souvenir
- auteur
- date de création

6. Upload photo
- ajout simple
- preview avant validation
- stockage Supabase Storage
- métadonnées en base

7. Détail jour
- galerie du jour
- légendes
- notes
- auteur
- édition / suppression

8. Visuel mensuel
- couverture du mois si définie
- sinon mosaïque automatique avec photos du mois
- sinon fallback élégant
- résumé du mois

9. Galerie mensuelle
- mosaïque premium
- lightbox
- filtres
- choix d’une photo favorite
- possibilité de définir la couverture du mois

10. Timeline
- affichage chronologique
- filtres par type, mois, année, auteur
- recherche texte

11. Activité récente
- ajout de souvenir
- ajout photo
- commentaire
- réaction

12. Réactions / commentaires
- cœur
- rire
- étoile
- nostalgie
- commentaires courts

13. Compteurs
- jours ensemble
- jours avant prochaine date importante
- nombre de souvenirs du mois
- nombre de photos du mois

14. Dates importantes
- anniversaire
- première rencontre
- voyage
- date personnalisée

15. Bucket list de couple
- liste d’idées à faire ensemble
- statut
- date prévue optionnelle
- transformation possible en souvenir

16. Capsules temporelles
- message écrit aujourd’hui à ouvrir plus tard
- invisible avant la date

17. Souvenir du jour / il y a 1 an
- bloc intelligent sur dashboard

18. Paramètres
- profil
- couple
- thème
- préférences d’affichage

Arborescence attendue :
- app/
- components/
- components/ui/
- features/
- lib/
- hooks/
- services/
- supabase/
- types/
- utils/
- styles/

Base de données Supabase attendue :
Tables minimales :
- profiles
- couples
- couple_members
- memories
- memory_photos
- monthly_covers
- reactions
- comments
- bucket_list_items
- time_capsules
- important_dates
- activity_logs

Je veux :
- le SQL complet
- les relations
- les index utiles
- les policies RLS
- la stratégie storage

Design attendu :
- premium
- doux
- élégant
- très moderne
- intime
- chaleureux
- animations subtiles
- esthétique haut de gamme
- rien de générique

Mode d’exécution demandé :
Travaille par phases, pas en une seule réponse confuse.

Phase 1 :
- propose l’arborescence complète du projet
- propose le schéma SQL Supabase
- propose les grandes décisions d’architecture
- crée un plan d’implémentation clair

Phase 2 :
- génère le squelette exécutable du projet Next.js
- configure Tailwind, Supabase, auth et structure App Router
- crée les fichiers principaux

Phase 3 :
- implémente les pages critiques :
  - auth
  - dashboard
  - calendrier
  - détail jour
  - ajout souvenir

Phase 4 :
- implémente galerie, timeline, bucket list, dates importantes, capsules temporelles

Phase 5 :
- améliore le design premium
- ajoute loading states, empty states, skeletons, toasts
- complète README et .env.example

Règles de travail :
- avant d’écrire beaucoup de code, commence par me montrer Phase 1
- attends validation avant d’enchaîner
- si tu crées du SQL Supabase, applique de bonnes pratiques de sécurité
- si tu crées des fonctions SQL, utilise des références qualifiées et une sécurité adaptée
- ne supprime pas des tests ou validations pour contourner un problème
- préfère un résultat réellement exécutable à une réponse trop théorique

Format de réponse attendu :
1. Résumé rapide
2. Arborescence
3. Schéma SQL
4. Plan d’implémentation
5. Ensuite seulement, commencer les fichiers du projet quand je valide