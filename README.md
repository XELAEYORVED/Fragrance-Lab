# Essentia — Plateforme e-commerce de parfums avec IA & 3D

🔗 **Démo en ligne : [fragrance-lab-kappa.vercel.app](https://fragrance-lab-kappa.vercel.app)**

> Hébergement gratuit : la toute première visite peut prendre quelques secondes, le temps que le serveur se réveille.

Projet Bac 3 Informatique & Développement d'Applications — Durée cible : ~1 mois

## 🎯 Objectif

Site e-commerce full-stack pour la vente de parfums, avec :
- Animation 3D interactive du flacon (rotation, zoom, lumière)
- Chatbot IA intégré qui recommande le parfum idéal selon les préférences de l'utilisateur (occasion, famille olfactive, intensité, budget), avec proposition automatique d'alternatives moins chères si le budget est dépassé

## 🧱 Stack technique

| Domaine | Techno |
|---|---|
| Frontend | Next.js (React, TypeScript, Tailwind CSS) |
| Backend | Node.js + Express (API REST) |
| Base de données | PostgreSQL (hébergée sur Neon) |
| ORM | Prisma |
| Paiement | Stripe (mode test) |
| 3D | Three.js via react-three-fiber + @react-three/drei |
| IA / Chatbot | API Claude (Anthropic), function calling |
| Authentification | NextAuth ou JWT maison |
| Déploiement | Vercel (frontend) + Railway ou Render (backend + DB) |
| Organisation | GitHub + GitHub Projects (board + milestones) |

## 🗺️ Roadmap — 4 sprints

### Semaine 1 — Fondations & backend
- Setup repo GitHub (branches `main`/`dev`), GitHub Project board (colonnes To do / In progress / Done)
- 4 milestones créés, un par semaine
- Init Next.js (`frontend/`) et Express (`backend/`) en mono-repo
- Modèle de données PostgreSQL via Prisma : produits, notes olfactives, prix, stock, users
- CRUD produits basique
- Seed de 15-20 parfums (fictifs ou réels) avec tags : famille olfactive, budget, intensité

### Semaine 2 — E-commerce fonctionnel
- Pages : catalogue, fiche produit, panier
- Authentification simple (JWT ou NextAuth)
- Intégration Stripe (mode test)
- Objectif : parcours d'achat complet de bout en bout (sans 3D ni chatbot pour l'instant)

### Semaine 3 — Chatbot IA de recommandation
- Intégration API Claude avec function calling
- Le chatbot pose 3-4 questions : occasion, famille de notes, budget, intensité
- Appelle une fonction backend qui filtre les produits en base (`searchPerfumes`)
- Si le match idéal dépasse le budget → propose automatiquement 2-3 alternatives moins chères avec un profil olfactif proche
- UI du chat en composant React flottant sur le site

### Semaine 4 — Animation 3D + finitions
- Un flacon modélisé (Blender ou modèle gratuit Sketchfab) intégré via react-three-fiber sur la fiche produit vedette
- Rotation à la souris, zoom, effet de lumière
- Polish : responsive, page 404, tests rapides
- Déploiement : Vercel (front) + Railway/Render (back + DB)

## 🚧 À faire — v1

Chaque fonctionnalité a sa branche et sera livrée par pull request.

- [ ] **🧮 Moteur de similarité** — `feature/similarity-engine`
  Pourcentage de ressemblance entre tous les parfums (notes pondérées par étage + accords), alternatives moins chères pour tout le catalogue. *Prérequis des fonctionnalités 1 et 3.*

- [ ] **📸 1. Prends ton flacon en photo** — `feature/photo-recognition`
  Le visiteur photographie son parfum avec son téléphone ; le site le reconnaît (vision de Claude), ouvre sa fiche et affiche aussitôt ses dupes et les alternatives moins chères. Un Shazam du parfum.

- [ ] **🌌 2. La galaxie olfactive** — `feature/olfactive-galaxy`
  Les ~1 900 parfums affichés comme des étoiles en 3D : ceux qui sentent pareil sont proches. Zoom, déplacement, dupes en orbite autour de leur original, familles olfactives en constellations.

- [ ] **🧪 3. Le laboratoire de superposition** — `feature/layering-lab`
  « Recrée Angels' Share (250 €) en superposant deux parfums à 30 € » : l'algorithme cherche la paire abordable dont les notes réunies ressemblent le plus à l'original, avec un pourcentage. Et dans l'autre sens : « que donne Khamrah + Naxos ? ».

- [ ] **⏳ 4. La vie du parfum sur la peau** — `feature/scent-timeline`
  Frise animée de ce que l'on sent dans le temps : à la pose (tête), après 1 h (cœur), après 6 h (fond), avec les photos des ingrédients qui apparaissent et s'effacent au fil du curseur.

- [ ] **💶 5. Le compteur d'économies** — `feature/savings-counter`
  « En passant de Baccarat Rouge à Club de Nuit Untold, vous économisez 312 € par an », calculé à partir du prix au ml et de 2 pulvérisations par jour.

## 🗃️ Modèle de données (aperçu Prisma / conceptuel)

```
Perfume {
  id
  name
  brand
  price
  olfactoryFamily   // ex: boisé, floral, oriental, frais
  topNotes[]
  heartNotes[]
  baseNotes[]
  intensity         // ex: léger, modéré, intense
  imageUrl
  model3dUrl
  stock
}

User {
  id
  email
  password (hashé)
  orders[]
}

Order {
  id
  userId
  items[]
  total
  status
  createdAt
}
```

## 🔌 Endpoints backend clés (REST)

- `GET /api/perfumes` — liste des parfums
- `GET /api/perfumes/:id` — détail d'un parfum
- `GET /api/perfumes/search?budget=&family=&intensity=` — recherche filtrée (utilisée par le chatbot)
- `POST /api/cart` — ajouter au panier
- `POST /api/orders` — créer une commande
- `POST /api/chat` — endpoint du chatbot (function calling côté serveur)

## ⚙️ Setup initial — checklist

- [ ] Créer le repo GitHub (`essentia` ou nom choisi)
- [ ] Activer GitHub Projects + créer les 4 milestones
- [ ] `npx create-next-app@latest frontend` (TypeScript, Tailwind, App Router)
- [ ] Créer `backend/`, `npm init -y`, installer `express`, `cors`, `dotenv`, `prisma`, `@prisma/client`
- [ ] Créer un projet PostgreSQL gratuit sur [neon.tech](https://neon.tech)
- [ ] Ajouter l'URL de connexion dans `.env` (jamais commité — ajouter au `.gitignore`)

## 📌 Notes

- Priorité donnée à un site **fonctionnel de bout en bout** plutôt qu'à une 3D exhaustive sur tout le catalogue : un seul flacon bien modélisé suffit pour la démo.
- Le chatbot doit s'appuyer sur une vraie fonction de recherche côté backend (pas de réponses inventées par le LLM) pour garantir que les recommandations correspondent à des produits réellement en stock.

## 🚀 Déploiement

| Partie | Hébergeur | Adresse |
|---|---|---|
| API (Express + Prisma) | Render, offre gratuite, région Ohio | https://fragrance-lab-api.onrender.com |
| Site (Next.js) | Vercel, offre gratuite | https://fragrance-lab-kappa.vercel.app |
| Base de données | Neon (PostgreSQL), aws us-east-2 | — |

- **API** : décrite dans [`render.yaml`](render.yaml) (Blueprint Render, branche `main`). Variable secrète à saisir dans Render : `DATABASE_URL`.
- **Site** : projet Vercel importé depuis ce dépôt, dossier racine `frontend`, variable `API_URL=https://fragrance-lab-api.onrender.com`.
  (La compilation de Next.js dépasse les 512 Mo de mémoire de l'offre gratuite de Render.)
- Chaque push sur `main` redéploie automatiquement l'API (Render) et le site (Vercel).
- La tâche GitHub [`keep-api-awake`](.github/workflows/keep-api-awake.yml) appelle l'API toutes les 10 minutes pour éviter sa mise en veille.
- Le site n'est pas référencé par les moteurs de recherche (projet de portfolio).

### En local

```bash
cd backend && npm run dev     # API sur http://localhost:4000
cd frontend && npm run dev    # site sur http://localhost:3000
```

Version optimisée (identique à la production) : `npm run build && npm start` dans chaque dossier.
