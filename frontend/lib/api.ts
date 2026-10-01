// Types et accès à l'API backend

// Adresse du backend, lue côté serveur uniquement (les pages appellent l'API depuis le serveur).
// Sur Render, API_HOST est fourni automatiquement par le service backend (sans « https:// »).
const API_URL =
  process.env.API_URL ?? (process.env.API_HOST ? `https://${process.env.API_HOST}` : "http://localhost:4000");

export type BottleShape = "ROUND" | "SQUARE" | "RECTANGLE" | "CYLINDER" | "PEBBLE" | "FACETED";
export type NoteLevel = "TOP" | "HEART" | "BASE";
export type Gender = "MASCULINE" | "FEMININE" | "UNISEX";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logoUrl: string | null;
};

export type FragranceAccord = { strength: number; accord: { name: string; slug: string } };
export type FragranceNote = {
  level: NoteLevel;
  note: { name: string; slug: string; imageUrl: string | null; imageSource: string | null };
};

export type PurchaseLink = {
  id: string;
  url: string;
  price: string;
  currency: string;
  sizeMl: number;
  inStock: boolean;
  retailer: { name: string; website: string };
};

type FragranceBase = {
  id: string;
  slug: string;
  name: string;
  year: number | null;
  gender: Gender | null;
  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;
  ratingCount: number | null;
  family: string | null;
  description: string | null;
  longevity: number | null;
  sillage: number | null;
  seasons: string[];
  timesOfDay: string[];
  bottleShape: BottleShape;
  liquidColor: string;
  capColor: string;
  imageUrl: string | null;
  brand: Brand;
};

export type FragranceSummary = FragranceBase & {
  accords: FragranceAccord[];
  _count: { dupes: number };
};

export type FragranceProfile = FragranceBase & {
  notes: FragranceNote[];
  accords: FragranceAccord[];
  links: PurchaseLink[];
};

export type FragranceDetail = FragranceProfile & {
  dupes: { id: string; similarity: number | null; dupe: FragranceProfile }[];
  inspiredBy: { id: string; original: FragranceBase }[];
};

// Le catalogue change rarement : les réponses sont gardées 5 minutes par Next.js,
// sauf quand une donnée doit être fraîche à chaque visite (flacon aléatoire)
async function get<T>(path: string, { fresh = false } = {}): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, fresh ? { cache: "no-store" } : { next: { revalidate: 300 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} sur ${path}`);
  return res.json() as Promise<T>;
}

export async function getFragrances(options: { q?: string; hasDupes?: boolean; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.hasDupes) params.set("hasDupes", "1");
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.size ? `?${params}` : "";
  return (await get<FragranceSummary[]>(`/api/fragrances${query}`)) ?? [];
}

export function getRandomFragrance() {
  return get<FragranceSummary>("/api/fragrances/random", { fresh: true });
}

// Fourchette de prix indicative pour 100 ml
export function priceRange(f: { priceMin: number | null; priceMax: number | null }) {
  if (f.priceMin == null || f.priceMax == null) return null;
  return `${f.priceMin} – ${f.priceMax} €`;
}

// Économie moyenne d'un dupe par rapport à l'original, en pourcentage
export function savings(
  original: { priceMin: number | null; priceMax: number | null },
  dupe: { priceMin: number | null; priceMax: number | null },
) {
  if (original.priceMin == null || original.priceMax == null || dupe.priceMin == null || dupe.priceMax == null) return null;
  const a = (original.priceMin + original.priceMax) / 2;
  const b = (dupe.priceMin + dupe.priceMax) / 2;
  return b < a ? Math.round((1 - b / a) * 100) : null;
}

export type BrandSummary = Brand & { _count: { fragrances: number } };
export type BrandDetail = Brand & { fragrances: FragranceSummary[] };

export async function getBrands() {
  return (await get<BrandSummary[]>("/api/brands")) ?? [];
}

export function getBrand(slug: string) {
  return get<BrandDetail>(`/api/brands/${encodeURIComponent(slug)}`);
}

export function getFragrance(slug: string) {
  return get<FragranceDetail>(`/api/fragrances/${encodeURIComponent(slug)}`);
}

// Libellés français
export const genderLabel: Record<Gender, string> = {
  MASCULINE: "Masculin",
  FEMININE: "Féminin",
  UNISEX: "Mixte",
};

export const levelLabel: Record<NoteLevel, string> = {
  TOP: "Tête",
  HEART: "Cœur",
  BASE: "Fond",
};

export const seasonLabel: Record<string, string> = {
  SPRING: "Printemps",
  SUMMER: "Été",
  AUTUMN: "Automne",
  WINTER: "Hiver",
};

export const timeLabel: Record<string, string> = { DAY: "Jour", NIGHT: "Nuit" };
