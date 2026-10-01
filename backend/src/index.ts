import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Profil olfactif complet d'un parfum : notes triées et accords du plus fort au plus faible
const profile = {
  brand: true,
  notes: { include: { note: true } },
  accords: { include: { accord: true }, orderBy: { strength: "desc" } },
  links: { include: { retailer: true }, orderBy: { price: "asc" } },
} satisfies Prisma.FragranceInclude;

// Route de test
app.get("/", (req, res) => {
  res.send("API Fragrance Lab en ligne 🌸");
});

// Champs affichés sur une carte de parfum
const card = {
  brand: true,
  accords: { include: { accord: true }, orderBy: { strength: "desc" }, take: 3 },
  _count: { select: { dupes: true } },
} satisfies Prisma.FragranceInclude;

// Liste des parfums : recherche par nom ou marque (?q=), originaux ayant des dupes (?hasDupes=1),
// nombre maximal de résultats (?limit=, 60 par défaut, 200 au plus)
app.get("/api/fragrances", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(Math.max(Number(req.query.limit) || 60, 1), 200);
  const where: Prisma.FragranceWhereInput = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
      ],
    }),
    ...(req.query.hasDupes === "1" && { dupes: { some: {} } }),
  };
  const fragrances = await prisma.fragrance.findMany({
    where,
    include: card,
    // Les parfums les plus notés d'abord, puis ceux qui ont une photo
    orderBy: [{ ratingCount: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: limit,
  });
  res.json(fragrances);
});

// Un parfum au hasard parmi ceux qui ont une vraie photo (flacon de l'accueil)
app.get("/api/fragrances/random", async (req, res) => {
  const where = { imageUrl: { not: null } };
  const count = await prisma.fragrance.count({ where });
  const [fragrance] = await prisma.fragrance.findMany({
    where,
    include: card,
    skip: Math.floor(Math.random() * Math.max(count, 1)),
    take: 1,
  });
  res.json(fragrance ?? null);
});

// Détail d'un parfum avec ses dupes et les originaux dont il s'inspire
app.get("/api/fragrances/:slug", async (req, res) => {
  const fragrance = await prisma.fragrance.findUnique({
    where: { slug: req.params.slug },
    include: {
      ...profile,
      dupes: { include: { dupe: { include: profile } }, orderBy: { similarity: "desc" } },
      inspiredBy: { include: { original: { include: { brand: true } } } },
    },
  });
  if (!fragrance) {
    res.status(404).json({ error: "Parfum introuvable" });
    return;
  }
  res.json(fragrance);
});

// Liste des marques avec leur nombre de parfums
app.get("/api/brands", async (req, res) => {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { fragrances: true } } },
    orderBy: { name: "asc" },
  });
  res.json(brands);
});

// Détail d'une marque avec tous ses parfums
app.get("/api/brands/:slug", async (req, res) => {
  const brand = await prisma.brand.findUnique({
    where: { slug: req.params.slug },
    include: {
      fragrances: {
        include: {
          brand: true,
          accords: { include: { accord: true }, orderBy: { strength: "desc" }, take: 3 },
          _count: { select: { dupes: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });
  if (!brand) {
    res.status(404).json({ error: "Marque introuvable" });
    return;
  }
  res.json(brand);
});

// Express 5 transmet ici les erreurs des routes async
app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
