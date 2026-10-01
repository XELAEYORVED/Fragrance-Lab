import { PrismaClient } from "@prisma/client";
import type { Season, TimeOfDay } from "@prisma/client";
import { nicheBrands, nicheFragrances, type NicheFragrance } from "./data/niche";

const prisma = new PrismaClient();

// Données de démarrage : pyramides et accords d'après les fiches publiques,
// à vérifier et compléter avant la démo.

// Les fiches historiques ont en plus un profil de performance et des accords
type SeedFragrance = NicheFragrance & {
  longevity?: number;
  sillage?: number;
  seasons?: Season[];
  timesOfDay?: TimeOfDay[];
  accords?: Record<string, number>;
};

const brands: { name: string; country: string; website?: string }[] = [
  { name: "Dior", country: "France", website: "https://www.dior.com" },
  { name: "Creed", country: "France", website: "https://www.creedfragrances.com" },
  { name: "Maison Francis Kurkdjian", country: "France", website: "https://www.franciskurkdjian.com" },
  { name: "Kilian Paris", country: "France", website: "https://www.bykilian.com" },
  { name: "Tom Ford", country: "États-Unis", website: "https://www.tomfordbeauty.com" },
  { name: "Lattafa Perfumes", country: "Émirats arabes unis" },
  { name: "Maison Alhambra", country: "Émirats arabes unis" },
  { name: "Armaf", country: "Émirats arabes unis" },
  { name: "Al Haramain", country: "Émirats arabes unis" },
];

// Logos officiels disponibles (sites des marques et Wikimedia Commons)
const brandLogos: Record<string, string> = {
  dior: "/logos/dior.svg",
  creed: "/logos/creed.svg",
  "tom-ford": "/logos/tom-ford.svg",
  "carolina-herrera": "/logos/carolina-herrera.svg",
  "lattafa-perfumes": "/logos/lattafa-perfumes.svg",
  xerjoff: "/logos/xerjoff.svg",
  montale: "/logos/montale.svg",
  "maison-crivelli": "/logos/maison-crivelli.svg",
  "al-haramain": "/logos/al-haramain.webp",
  armaf: "/logos/armaf.webp",
  "initio-parfums-prives": "/logos/initio-parfums-prives.webp",
  korres: "/logos/korres.webp",
  "parfums-de-marly": "/logos/parfums-de-marly.webp",
  "le-labo": "/logos/le-labo.webp",
};

const fragrances: SeedFragrance[] = [
  // ─── Originaux ───
  {
    slug: "dior-sauvage-edt",
    name: "Sauvage",
    brand: "Dior",
    year: 2015,
    gender: "MASCULINE",
    concentration: "EAU_DE_TOILETTE",
    family: "Aromatique fougère",
    description: "Un frais épicé porté par la bergamote et le poivre sur un fond ambroxan très diffusif.",
    longevity: 7,
    sillage: 8,
    seasons: ["SPRING", "SUMMER", "AUTUMN"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "CYLINDER",
    liquidColor: "#3A5F8A",
    capColor: "#1C1C1C",
    top: ["Bergamote de Calabre", "Poivre"],
    heart: ["Poivre de Sichuan", "Lavande", "Poivre rose", "Vétiver", "Patchouli", "Géranium", "Élémi"],
    base: ["Ambroxan", "Cèdre", "Labdanum"],
    accords: { "Frais épicé": 100, Ambré: 72, Agrumes: 65, Aromatique: 58, Musqué: 45, Boisé: 42 },
  },
  {
    slug: "creed-aventus",
    name: "Aventus",
    brand: "Creed",
    year: 2010,
    gender: "MASCULINE",
    concentration: "EAU_DE_PARFUM",
    family: "Chypré fruité",
    description: "Ananas et bouleau fumé sur un fond de mousse de chêne et d'ambre gris.",
    longevity: 7,
    sillage: 7,
    seasons: ["SPRING", "SUMMER", "AUTUMN"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "ROUND",
    liquidColor: "#F2F2F0",
    capColor: "#C0C0C0",
    top: ["Ananas", "Bergamote", "Cassis", "Pomme"],
    heart: ["Bouleau", "Patchouli", "Jasmin", "Rose"],
    base: ["Musc", "Mousse de chêne", "Ambre gris", "Vanille"],
    accords: { Fruité: 100, Fumé: 70, Boisé: 68, Musqué: 55, Frais: 50, Cuir: 40 },
  },
  {
    slug: "mfk-baccarat-rouge-540",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    year: 2015,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Ambré floral",
    description: "Safran et jasmin sur un sillage ambré et minéral, devenu une signature olfactive.",
    longevity: 9,
    sillage: 9,
    seasons: ["AUTUMN", "WINTER", "SPRING"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "SQUARE",
    liquidColor: "#E9A27C",
    capColor: "#C9A15A",
    top: ["Safran", "Jasmin"],
    heart: ["Bois ambré", "Ambre gris"],
    base: ["Résine de sapin", "Cèdre"],
    accords: { Ambré: 100, Boisé: 75, "Chaud épicé": 62, Sucré: 55, Floral: 40 },
  },
  {
    slug: "kilian-angels-share",
    name: "Angels' Share",
    brand: "Kilian Paris",
    year: 2020,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Ambré gourmand",
    description: "Un cognac épicé de cannelle, adouci par la fève tonka et un praliné vanillé.",
    longevity: 8,
    sillage: 7,
    seasons: ["AUTUMN", "WINTER"],
    timesOfDay: ["NIGHT"],
    bottleShape: "SQUARE",
    liquidColor: "#B5651D",
    capColor: "#2A1A0E",
    top: ["Cognac"],
    heart: ["Cannelle", "Fève tonka", "Chêne"],
    base: ["Praliné", "Vanille", "Santal"],
    accords: { Sucré: 100, "Chaud épicé": 85, Vanillé: 80, Boisé: 60, Alcoolisé: 58, Cannelle: 55 },
  },
  {
    slug: "tom-ford-tobacco-vanille",
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    year: 2007,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Oriental épicé",
    description: "Feuille de tabac et épices sur un cœur de vanille, cacao et fruits secs.",
    longevity: 9,
    sillage: 8,
    seasons: ["AUTUMN", "WINTER"],
    timesOfDay: ["NIGHT"],
    bottleShape: "SQUARE",
    liquidColor: "#8B4A1C",
    capColor: "#2B2B2B",
    top: ["Feuille de tabac", "Épices"],
    heart: ["Fleur de tabac", "Vanille", "Cacao", "Fève tonka"],
    base: ["Fruits secs", "Notes boisées"],
    accords: { Tabac: 100, Vanillé: 90, Sucré: 70, "Chaud épicé": 65, Boisé: 45, Cacao: 40 },
  },

  // ─── Dupes ───
  {
    slug: "maison-alhambra-salvo",
    name: "Salvo",
    brand: "Maison Alhambra",
    year: 2022,
    gender: "MASCULINE",
    concentration: "EAU_DE_PARFUM",
    family: "Oriental fougère",
    description: "Une interprétation abordable du frais épicé ambroxan, avec une touche vanillée.",
    longevity: 6,
    sillage: 7,
    seasons: ["SPRING", "SUMMER", "AUTUMN"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "CYLINDER",
    liquidColor: "#2F4E73",
    capColor: "#111111",
    top: ["Bergamote"],
    heart: ["Lavande", "Poivre de Sichuan", "Anis étoilé", "Muscade"],
    base: ["Ambroxan", "Vanille"],
    accords: { "Frais épicé": 100, Ambré: 68, Agrumes: 60, Aromatique: 55, Boisé: 40 },
    dupeOf: ["dior-sauvage-edt"],
  },
  {
    slug: "armaf-club-de-nuit-intense-man",
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    year: 2015,
    gender: "MASCULINE",
    concentration: "EAU_DE_TOILETTE",
    family: "Chypré fruité",
    description: "Le dupe le plus célèbre d'Aventus, plus citronné et plus fumé à l'ouverture.",
    longevity: 8,
    sillage: 8,
    seasons: ["SPRING", "AUTUMN", "WINTER"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "RECTANGLE",
    liquidColor: "#2A2A2A",
    capColor: "#1A1A1A",
    top: ["Citron", "Ananas", "Bergamote", "Cassis", "Pomme"],
    heart: ["Bouleau", "Jasmin", "Rose"],
    base: ["Musc", "Ambre gris", "Patchouli", "Vanille"],
    accords: { Fruité: 95, Fumé: 85, Agrumes: 70, Boisé: 60, Musqué: 50 },
    dupeOf: ["creed-aventus"],
  },
  {
    slug: "al-haramain-laventure",
    name: "L'Aventure",
    brand: "Al Haramain",
    year: 2016,
    gender: "MASCULINE",
    concentration: "EAU_DE_PARFUM",
    family: "Chypré fruité",
    description: "Une version plus citronnée et plus légère de l'accord ananas-bouleau.",
    longevity: 6,
    sillage: 6,
    seasons: ["SPRING", "SUMMER"],
    timesOfDay: ["DAY"],
    bottleShape: "RECTANGLE",
    liquidColor: "#D8E0E6",
    capColor: "#8A8A8A",
    top: ["Citron", "Bergamote", "Élémi"],
    heart: ["Notes boisées", "Jasmin", "Muguet"],
    base: ["Musc", "Patchouli", "Ambre"],
    accords: { Agrumes: 100, Fruité: 70, Boisé: 60, Musqué: 55, Frais: 50 },
    dupeOf: ["creed-aventus"],
  },
  {
    slug: "armaf-club-de-nuit-untold",
    name: "Club de Nuit Untold",
    brand: "Armaf",
    year: 2022,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Ambré floral",
    description: "Une interprétation très proche de l'accord safran-bois ambré.",
    longevity: 8,
    sillage: 8,
    seasons: ["AUTUMN", "WINTER", "SPRING"],
    timesOfDay: ["DAY", "NIGHT"],
    bottleShape: "RECTANGLE",
    liquidColor: "#D98E6A",
    capColor: "#1A1A1A",
    top: ["Safran", "Jasmin"],
    heart: ["Bois ambré", "Ambre gris"],
    base: ["Résine de sapin", "Cèdre"],
    accords: { Ambré: 100, Boisé: 72, "Chaud épicé": 60, Sucré: 58, Floral: 38 },
    dupeOf: ["mfk-baccarat-rouge-540"],
  },
  {
    slug: "lattafa-khamrah",
    name: "Khamrah",
    brand: "Lattafa Perfumes",
    year: 2022,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Oriental épicé",
    description: "Un gourmand vanille-ambre sucré et épicé, aux dattes et au praliné.",
    longevity: 8,
    sillage: 8,
    seasons: ["AUTUMN", "WINTER"],
    timesOfDay: ["NIGHT"],
    bottleShape: "SQUARE",
    liquidColor: "#D57514",
    capColor: "#F0DDD0",
    top: ["Cannelle", "Muscade", "Bergamote"],
    heart: ["Dattes", "Praliné", "Tubéreuse", "Mahonial"],
    base: ["Vanille", "Fève tonka", "Bois ambré", "Myrrhe", "Benjoin", "Akigalawood"],
    accords: { Sucré: 100, "Chaud épicé": 82, Vanillé: 80, Ambré: 77, Cannelle: 68, Boisé: 49 },
    dupeOf: ["kilian-angels-share"],
  },
  {
    slug: "maison-alhambra-tobacco-touch",
    name: "Tobacco Touch",
    brand: "Maison Alhambra",
    year: 2020,
    gender: "UNISEX",
    concentration: "EAU_DE_PARFUM",
    family: "Oriental épicé",
    description: "Tabac, vanille et épices dans l'esprit de Tobacco Vanille, à petit prix.",
    longevity: 7,
    sillage: 7,
    seasons: ["AUTUMN", "WINTER"],
    timesOfDay: ["NIGHT"],
    bottleShape: "SQUARE",
    liquidColor: "#7A3F18",
    capColor: "#3A2A1A",
    top: ["Feuille de tabac", "Épices"],
    heart: ["Fleur de tabac", "Vanille", "Cacao", "Fève tonka"],
    base: ["Fruits secs", "Notes boisées"],
    accords: { Tabac: 100, Vanillé: 85, Sucré: 72, "Chaud épicé": 60, Boisé: 40 },
    dupeOf: ["tom-ford-tobacco-vanille"],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // Repartir d'une base propre à chaque seed
  await prisma.dupeRating.deleteMany();
  await prisma.dupe.deleteMany();
  await prisma.purchaseLink.deleteMany();
  await prisma.fragrance.deleteMany();
  await prisma.note.deleteMany();
  await prisma.accord.deleteMany();
  await prisma.brand.deleteMany();

  for (const brand of [...brands, ...nicheBrands]) {
    const slug = slugify(brand.name);
    await prisma.brand.create({ data: { ...brand, slug, logoUrl: brandLogos[slug] ?? null } });
  }

  const all: SeedFragrance[] = [...fragrances, ...nicheFragrances];

  // Notes et accords créés d'abord : un même parfum peut citer une note à deux étages
  const noteNames = new Set(all.flatMap((f) => [...f.top, ...f.heart, ...f.base]));
  await prisma.note.createMany({ data: [...noteNames].map((name) => ({ name, slug: slugify(name) })) });
  const accordNames = new Set(all.flatMap((f) => Object.keys(f.accords ?? {})));
  await prisma.accord.createMany({ data: [...accordNames].map((name) => ({ name, slug: slugify(name) })) });

  for (const f of all) {
    const { brand, top, heart, base, accords, dupeOf, ...data } = f;
    const notes = [
      ...top.map((name) => ({ name, level: "TOP" as const })),
      ...heart.map((name) => ({ name, level: "HEART" as const })),
      ...base.map((name) => ({ name, level: "BASE" as const })),
    ];

    await prisma.fragrance.create({
      data: {
        ...data,
        imageUrl: `/bottles/${data.slug}.webp`,
        brand: { connect: { name: brand } },
        notes: {
          create: notes.map(({ name, level }) => ({ level, note: { connect: { name } } })),
        },
        accords: {
          create: Object.entries(accords ?? {}).map(([name, strength]) => ({
            strength,
            accord: { connect: { name } },
          })),
        },
      },
    });
  }

  for (const f of all) {
    for (const originalSlug of f.dupeOf ?? []) {
      await prisma.dupe.create({
        data: {
          original: { connect: { slug: originalSlug } },
          dupe: { connect: { slug: f.slug } },
        },
      });
    }
  }

  const counts = {
    marques: await prisma.brand.count(),
    parfums: await prisma.fragrance.count(),
    notes: await prisma.note.count(),
    accords: await prisma.accord.count(),
    dupes: await prisma.dupe.count(),
  };
  console.log("Seed terminé :", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
