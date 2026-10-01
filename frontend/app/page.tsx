import Link from "next/link";
import BottleViewer from "@/components/BottleViewer";
import FragranceCard from "@/components/FragranceCard";
import Reveal from "@/components/Reveal";
import { getFragrances, getRandomFragrance } from "@/lib/api";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  // Sans recherche, on met en avant les originaux qui ont des dupes
  const [shown, hero] = await Promise.all([
    getFragrances(query ? { q: query, limit: 60 } : { hasDupes: true, limit: 60 }),
    // Un flacon différent à chaque chargement, choisi parmi ceux qui ont une vraie photo
    getRandomFragrance(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-16 pb-20 md:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <p className="glass-pill reveal-item mb-8 inline-block px-4 py-1.5 text-xs font-medium text-muted" style={{ "--i": 0 } as React.CSSProperties}>
            Les parfums du monde · et leurs doubles
          </p>
          <h1 className="reveal-item text-5xl font-semibold tracking-tight md:text-7xl md:leading-[1.02]" style={{ "--i": 1 } as React.CSSProperties}>
            Le parfum que vous aimez.
            <br />
            <span className="bg-gradient-to-r from-accent to-[var(--blob-2)] bg-clip-text text-transparent">
              Au prix que vous voulez.
            </span>
          </h1>
          <p className="reveal-item mt-6 max-w-md text-lg leading-relaxed text-muted" style={{ "--i": 3 } as React.CSSProperties}>
            Comparez les notes, mesurez la ressemblance et trouvez l&apos;alternative qui vous
            ressemble.
          </p>
          <form action="/" className="glass-pill reveal-item mt-10 flex max-w-md items-center py-1.5 pr-1.5 pl-5 focus-within:ring-2 focus-within:ring-accent/40" style={{ "--i": 4 } as React.CSSProperties}>
            <input
              name="q"
              defaultValue={query}
              placeholder="Rechercher un parfum ou une marque…"
              className="flex-1 bg-transparent py-2 outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition duration-200 hover:opacity-85 active:scale-95"
            >
              Chercher
            </button>
          </form>
        </Reveal>
        {hero && (
          <Reveal className="glass mx-auto w-full max-w-sm overflow-hidden rounded-[2.5rem] pb-8">
            <BottleViewer
              className="aspect-square w-full"
              shape={hero.bottleShape}
              liquidColor={hero.liquidColor}
              capColor={hero.capColor}
              imageUrl={hero.imageUrl}
            />
            <Link href={`/parfum/${hero.slug}`} className="block text-center">
              <p className="text-xs text-muted">{hero.brand.name}</p>
              <p className="text-xl font-semibold tracking-tight transition-colors hover:text-accent">{hero.name} →</p>
            </Link>
          </Reveal>
        )}
      </section>

      {/* Conseiller IA (feature/ai-chatbot) */}
      <Reveal as="section" id="conseiller" className="glass grid scroll-mt-28 gap-10 rounded-[2.5rem] p-8 md:grid-cols-2 md:p-12">
        <div>
          <p className="text-xs font-medium text-accent">Conseiller · bientôt</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">Décrivez ce que vous aimez.</h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            Occasion, notes préférées, budget : notre conseiller trouve votre parfum idéal et ses
            alternatives moins chères.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="reveal-item ml-auto w-fit max-w-xs rounded-3xl rounded-br-md bg-accent px-4 py-3 text-white dark:text-background" style={{ "--i": 3 } as React.CSSProperties}>
            Je cherche un parfum sucré et épicé pour l&apos;hiver, moins de 50 €.
          </p>
          <p className="glass-strong reveal-item w-fit max-w-sm rounded-3xl rounded-bl-md px-4 py-3 leading-relaxed" style={{ "--i": 9 } as React.CSSProperties}>
            Angels&apos; Share de Kilian correspond à votre profil. Son dupe Khamrah de Lattafa
            reprend le cognac, la cannelle et la vanille, pour une fraction du prix.
          </p>
        </div>
      </Reveal>

      {/* Catalogue */}
      <section id="catalogue" className="scroll-mt-28 py-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-4xl font-semibold tracking-tight">
            {query ? <>Résultats pour « {query} »</> : "Les originaux"}
          </h2>
          <span className="text-sm text-muted">
            {shown.length} parfum{shown.length > 1 ? "s" : ""}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="text-muted">Aucun parfum trouvé.</p>
        ) : (
          <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((f, i) => (
              <div key={f.id} className="reveal-item" style={{ "--i": i } as React.CSSProperties}>
                <FragranceCard fragrance={f} />
              </div>
            ))}
          </Reveal>
        )}
      </section>
    </main>
  );
}
