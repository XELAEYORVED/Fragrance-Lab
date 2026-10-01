import Link from "next/link";
import BottleThumb from "@/components/BottleThumb";
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
      {/* Hero, façon page produit Apple */}
      <section className="pt-20 pb-16 text-center md:pt-28">
        <Reveal>
          <p className="reveal-item text-lg font-semibold text-accent" style={{ "--i": 0 } as React.CSSProperties}>
            Fragrance Lab
          </p>
          <h1
            className="display reveal-item mx-auto mt-3 max-w-4xl text-5xl sm:text-6xl md:text-8xl"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Le parfum que vous aimez.
            <br />
            <span className="text-muted">Au prix que vous voulez.</span>
          </h1>
          <p
            className="reveal-item mx-auto mt-6 max-w-2xl text-xl leading-snug text-muted md:text-2xl"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            Près de 2 000 parfums de plus de 100 maisons. Leurs notes, leurs dupes, leur prix.
          </p>
          <div className="reveal-item mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4" style={{ "--i": 4 } as React.CSSProperties}>
            <Link
              href="#catalogue"
              className="rounded-full bg-accent px-6 py-3 text-[17px] font-medium text-white transition hover:brightness-110 active:scale-95"
            >
              Explorer le catalogue
            </Link>
            <Link href="#conseiller" className="text-[17px] text-accent hover:underline">
              Trouver mon parfum ›
            </Link>
          </div>
          <form
            action="/"
            className="glass-pill glass-backdrop reveal-item mx-auto mt-10 flex max-w-xl items-center py-1.5 pr-1.5 pl-6 focus-within:ring-2 focus-within:ring-accent/50"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            <input
              name="q"
              defaultValue={query}
              placeholder="Un parfum, une maison…"
              className="flex-1 bg-transparent py-2.5 text-[17px] outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-2.5 text-[15px] font-medium text-background transition hover:opacity-85 active:scale-95"
            >
              Rechercher
            </button>
          </form>
        </Reveal>

        {/* Flacon vedette, exposé sur un panneau de verre */}
        {hero && (
          <Reveal className="glass glass-lens mx-auto mt-16 max-w-3xl overflow-hidden rounded-[3rem] px-8 pt-14 pb-10">
            <Link href={`/parfum/${hero.slug}`} className="group block">
              <BottleThumb
                fragrance={hero}
                className="mx-auto w-full max-w-[260px] transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
              />
              <p className="mt-8 text-sm text-muted">{hero.brand.name}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{hero.name}</p>
              <p className="mt-3 text-[17px] text-accent group-hover:underline">Découvrir ›</p>
            </Link>
          </Reveal>
        )}
      </section>

      {/* Conseiller IA (feature/ai-chatbot) */}
      <Reveal as="section" id="conseiller" className="glass glass-lens grid scroll-mt-28 gap-10 rounded-[2.5rem] p-8 md:grid-cols-2 md:p-12">
        <div>
          <p className="text-xs font-medium text-accent">Conseiller · bientôt</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">Décrivez ce que vous aimez.</h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            Occasion, notes préférées, budget : notre conseiller trouve votre parfum idéal et ses
            alternatives moins chères.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="reveal-item ml-auto w-fit max-w-xs rounded-3xl rounded-br-md bg-accent px-4 py-3 text-white" style={{ "--i": 3 } as React.CSSProperties}>
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
        <div className="mb-10 text-center">
          <h2 className="display text-4xl md:text-6xl">
            {query ? (
              <>Résultats pour « {query} ».</>
            ) : (
              <>
                Les originaux. <span className="text-muted">Et leurs dupes.</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-[17px] text-muted">
            {shown.length} parfum{shown.length > 1 ? "s" : ""}
          </p>
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
