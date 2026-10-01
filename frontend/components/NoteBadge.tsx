// Note olfactive illustrée par la photo de son ingrédient, pour voir d'un coup d'œil à quoi s'attendre.
// Sans photo, une pastille dégradée porte l'initiale de la note.

type NoteBadgeProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
};

// Vignette ronde (photo ou initiale)
export function NoteImage({ name, imageUrl, size }: { name: string; imageUrl?: string | null; size: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- petites vignettes déjà optimisées (WebP 240 px)
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        draggable={false}
        className={`${size} shrink-0 rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] ring-1 ring-black/5`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/70 to-[var(--blob-2)]/70 text-[0.7em] font-semibold text-white`}
    >
      {name[0]}
    </span>
  );
}

// Tuile de la pyramide olfactive : grande photo ronde et nom dessous
export function NoteTile({ name, imageUrl, className, style }: NoteBadgeProps) {
  return (
    <figure className={`group flex w-20 flex-col items-center gap-2 text-center ${className ?? ""}`} style={style}>
      <span className="glass-pill p-1 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110">
        <NoteImage name={name} imageUrl={imageUrl} size="size-14" />
      </span>
      <figcaption className="text-xs leading-tight">{name}</figcaption>
    </figure>
  );
}

// Pastille compacte des comparaisons : petite photo à gauche du nom
export function NoteChip({ name, imageUrl, className, style, children }: NoteBadgeProps & { children?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pr-3 pl-0.5 ${className ?? ""}`} style={style}>
      <NoteImage name={name} imageUrl={imageUrl} size="size-6" />
      {children ?? name}
    </span>
  );
}
