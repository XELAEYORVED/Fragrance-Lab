import Link from "next/link";

const links = [
  { href: "/marques", label: "Marques" },
  { href: "/#catalogue", label: "Catalogue" },
  { href: "/#conseiller", label: "Conseiller" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <nav className="glass-pill glass-nav mx-auto flex max-w-6xl items-center justify-between py-2 pr-2 pl-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fragrance <span className="text-accent">Lab</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-muted transition hover:bg-white/40 hover:text-foreground dark:hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
