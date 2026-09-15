# Essentia — Plateforme e-commerce de parfums avec IA & 3D

Projet Bac 2 Informatique & Développement d'Applications — Durée cible : ~1 mois

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
