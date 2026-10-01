// Types et accès à l'API backend

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type BottleShape = "ROUND" | "SQUARE" | "RECTANGLE" | "CYLINDER" | "PEBBLE" | "FACETED";
export type NoteLevel = "TOP" | "HEART" | "BASE";
export type Gender = "MASCULINE" | "FEMININE" | "UNISEX";

export type Brand = { id: string; name: string; slug: string; country: string | null };

export type FragranceAccord = { strength: number; accord: { name: string; slug: string } };
export type FragranceNote = { level: NoteLevel; note: { name: string; slug: string } };

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
  gender: Gender;
  family: string | null;
  description: string | null;
  longevity: number | null;
  sillage: number | null;
  seasons: string[];
  timesOfDay: string[];
  bottleShape: BottleShape;
  liquidColor: string;
  capColor: string;
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

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} sur ${path}`);
  return res.json() as Promise<T>;
}

export async function getFragrances(q?: string) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return (await get<FragranceSummary[]>(`/api/fragrances${query}`)) ?? [];
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
