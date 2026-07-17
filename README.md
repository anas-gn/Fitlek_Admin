# SIRVYA Admin — Console de modération

Application **Next.js full-stack** (front-end + API back-end intégrées) pour administrer la
plateforme Fitlek : approbation des comptes coach/conseiller, bannissement,
suppression de comptes, et tableau de bord (réservations, revenus, répartition des rôles…).

Le back-end est constitué des routes API Next.js (`app/api/**`) qui interrogent directement
votre base **MySQL / MariaDB** `fitlekdb` (le fichier `database/fitlekdb.sql` fourni est
exactement votre export).

## 1. Prérequis

- Node.js 18+ et npm
- Une base MySQL/MariaDB avec le schéma `fitlekdb` importé (voir `database/fitlekdb.sql`)

## 2. Installation

```bash
npm install
```

## 3. Configuration

Copiez `.env.example` vers `.env.local` et renseignez vos identifiants de base de données :

```bash
cp .env.example .env.local
```

```
DB_HOST=127.0.0.1
DB_PORT=3308
DB_USER=root
DB_PASSWORD=
DB_NAME=fitlekdb
JWT_SECRET=changez-moi-en-une-longue-chaine-aleatoire
SESSION_HOURS=12
```

## 4. Importer la base (si ce n'est pas déjà fait)

```bash
mysql -u root -p < database/fitlekdb.sql
```

## 5. Créer un compte admin utilisable

Les mots de passe présents dans le dump d'exemple ne sont **pas** de vrais hachages bcrypt
(données de démo), la connexion admin ne fonctionnera donc pas telle quelle. Ce script crée
ou met à jour un compte avec un vrai mot de passe haché :

```bash
node scripts/create-admin.js admin@fitlek.com "MonMotDePasseSolide!" "Admin" "Fitlek"
```

Cela crée (ou transforme un compte existant en) un utilisateur avec `role = 'admin'`.

## 6. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous serez redirigé vers
`/admin/login`. Connectez-vous avec l'e-mail et le mot de passe créés à l'étape 5.

Pour la production :

```bash
npm run build
npm start
```

## Fonctionnalités

- **Connexion admin sécurisée** — session signée (JWT) stockée dans un cookie `httpOnly`,
  vérifiée côté serveur sur chaque route API (`lib/auth.js` → `requireAdmin`).
- **Tableau de bord** (`/admin/dashboard`) : nombre total de comptes par rôle, comptes en
  attente d'approbation, bannissements actifs, statut des réservations, revenu confirmé,
  classement des coachs les mieux notés.
- **Comptes** (`/admin/users`) : recherche, filtre par rôle et par statut
  (en attente / approuvé / banni), actions :
  - **Approuver / retirer l'approbation** un compte coach ou conseiller (`isApproved`)
  - **Bannir** (temporaire avec durée, ou permanent, avec motif) → insère une ligne dans `bans`
  - **Lever un bannissement**
  - **Supprimer** définitivement un compte (client, coach ou conseiller) — les données liées
    (réservations, avis, messages, tokens…) sont supprimées en cascade grâce aux contraintes
    `ON DELETE CASCADE` déjà présentes dans le schéma.
- **Réservations** (`/admin/reservations`) : liste filtrable par statut
  (en attente / confirmée / annulée) avec client, coach, date, lieu et prix.
- **Bannissements** (`/admin/bans`) : historique complet, filtre "actifs uniquement",
  action pour lever un bannissement directement depuis l'historique.
- **Nouvel admin** (`/admin/register`) : formulaire réservé aux admins déjà connectés pour
  créer d'autres comptes admin (mot de passe haché avec bcrypt, e-mail vérifié comme unique).
  L'API `/api/auth/register` refuse toute requête non authentifiée (401).

## Structure du projet

```
app/
  admin/
    login/              page de connexion (hors layout console)
    (console)/           regroupement de routes avec sidebar + topbar
      dashboard/
      users/
      reservations/
      bans/
  api/
    auth/login|logout|me
    stats/
    users/[id]/{approve,ban,unban}
    bans/[id]/lift
    reservations/
components/              composants UI réutilisables (ConsoleShell, Badge, Modal, StatCard)
lib/
  db.js                  pool de connexions mysql2
  auth.js                signature / vérification des sessions JWT
middleware.js             redirection basique si le cookie de session est absent
scripts/create-admin.js   utilitaire CLI pour créer/réinitialiser un admin
database/fitlekdb.sql     export SQL fourni (schéma + données de démonstration)
```

## Sécurité — points à adapter avant une mise en production réelle

- Changez `JWT_SECRET` pour une valeur longue et aléatoire.
- Servez l'application en HTTPS (le cookie de session n'est pas marqué `secure` pour
  faciliter les tests en local ; ajoutez `secure: true` dans `app/api/auth/login/route.js`
  une fois en HTTPS).
- Les routes de suppression/bannissement empêchent de cibler son propre compte ou un autre
  admin, mais ajoutez si besoin une journalisation (audit log) des actions de modération.
