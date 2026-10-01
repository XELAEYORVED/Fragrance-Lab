import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-wide">
          Fragrance <span className="italic text-accent">Lab</span>
        </Link>
        <div className="flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-muted">
          <Link href="/#catalogue" className="transition-colors hover:text-foreground">
            Catalogue
          </Link>
          <Link href="/#conseiller" className="transition-colors hover:text-foreground">
            Conseiller
          </Link>
        </div>
      </nav>
    </header>
  );
}
