import type { FragranceProfile, NoteLevel } from "./api";

// Comparaison factuelle des notes et accords de deux parfums.
// Le score de ressemblance pondéré viendra du moteur de similarité côté backend.

export const levels: NoteLevel[] = ["TOP", "HEART", "BASE"];

function notesAt(fragrance: FragranceProfile, level: NoteLevel) {
  return fragrance.notes.filter((n) => n.level === level).map((n) => n.note.name);
}

export function compareNotes(original: FragranceProfile, dupe: FragranceProfile) {
  const allOriginal = new Set(original.notes.map((n) => n.note.name));
  const allDupe = new Set(dupe.notes.map((n) => n.note.name));
  const sharedTotal = [...allOriginal].filter((name) => allDupe.has(name)).length;

  const byLevel = levels.map((level) => {
    const a = notesAt(original, level);
    const b = notesAt(dupe, level);
    return {
      level,
      shared: a.filter((name) => b.includes(name)),
      onlyOriginal: a.filter((name) => !b.includes(name)),
      onlyDupe: b.filter((name) => !a.includes(name)),
    };
  });

  return { byLevel, sharedTotal, originalTotal: allOriginal.size };
}

export function compareAccords(original: FragranceProfile, dupe: FragranceProfile) {
  const names = [...new Set([...original.accords, ...dupe.accords].map((a) => a.accord.name))];
  const strength = (f: FragranceProfile, name: string) =>
    f.accords.find((a) => a.accord.name === name)?.strength ?? 0;

  return names
    .map((name) => ({ name, original: strength(original, name), dupe: strength(dupe, name) }))
    .sort((x, y) => y.original + y.dupe - (x.original + x.dupe));
}

export function lowestPrice(fragrance: FragranceProfile) {
  const link = fragrance.links[0];
  return link ? `${Number(link.price).toFixed(2)} ${link.currency}` : null;
}
