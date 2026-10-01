import Link from "next/link";

const links = [
  { href: "/marques", label: "Marques" },
  { href: "/#catalogue", label: "Catalogue" },
  { href: "/#conseiller", label: "Conseiller" },
];

// Barre de navigation : capsule de verre clair qui flotte au-dessus de la page
export default function Header() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-3">
      <nav className="glass-pill glass-nav mx-auto flex max-w-3xl items-center justify-between py-1.5 pr-1.5 pl-5">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Fragrance Lab
        </Link>
        <div className="flex items-center gap-0.5 text-[13px]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden rounded-full px-3.5 py-1.5 text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground sm:block"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#conseiller"
            className="ml-1 rounded-full bg-accent px-4 py-1.5 font-medium text-white transition hover:brightness-110 active:scale-95"
          >
            Trouver mon parfum
          </Link>
        </div>
      </nav>
    </header>
  );
}
