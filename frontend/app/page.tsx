import Link from "next/link";
import Bottle from "@/components/Bottle";
import { getFragrances } from "@/lib/api";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const fragrances = await getFragrances(query);
  // Sans recherche, on met en avant les originaux qui ont des dupes
  const shown = query ? fragrances : fragrances.filter((f) => f._count.dupes > 0);
  const hero = shown[0];

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-24 md:grid-cols-[1.2fr_1fr]">
        <div className="animate-rise">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-accent">
            Les parfums du monde · et leurs doubles
          </p>
          <h1 className="font-display text-6xl leading-[0.95] font-light md:text-7xl">
            Le parfum que vous aimez.
            <br />
            <span className="italic text-accent">Au prix que vous voulez.</span>
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
            Comparez les notes, mesurez la ressemblance et trouvez l&apos;alternative qui vous
            ressemble.
          </p>
          <form action="/" className="mt-10 flex max-w-md border-b border-line focus-within:border-accent">
            <input
              name="q"
              defaultValue={query}
              placeholder="Rechercher un parfum ou une marque…"
              className="flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted"
            />
            <button type="submit" className="text-xs uppercase tracking-[0.2em] text-accent">
              Chercher
            </button>
          </form>
        </div>
        {hero && (
          <Link href={`/parfum/${hero.slug}`} className="relative mx-auto block w-56 md:w-72">
            <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft blur-3xl" />
            <Bottle
              shape={hero.bottleShape}
              liquidColor={hero.liquidColor}
              capColor={hero.capColor}
              animated
            />
          </Link>
        )}
      </section>

      {/* Conseiller IA (feature/ai-chatbot) */}
      <section id="conseiller" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">Conseiller · bientôt</p>
            <h2 className="font-display text-4xl font-light">Décrivez ce que vous aimez.</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-muted">
              Occasion, notes préférées, budget : notre conseiller trouve votre parfum idéal et ses
              alternatives moins chères.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <p className="ml-auto w-fit max-w-xs rounded-2xl rounded-br-sm bg-accent px-4 py-3 text-background">
              Je cherche un parfum sucré et épicé pour l&apos;hiver, moins de 50 €.
            </p>
            <p className="w-fit max-w-sm rounded-2xl rounded-bl-sm bg-surface-raised px-4 py-3 leading-relaxed">
              Angels&apos; Share de Kilian correspond à votre profil. Son dupe Khamrah de Lattafa
              reprend le cognac, la cannelle et la vanille, pour une fraction du prix.
            </p>
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section id="catalogue" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-4xl font-light">
            {query ? <>Résultats pour « {query} »</> : "Les originaux"}
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {shown.length} parfum{shown.length > 1 ? "s" : ""}
          </span>
        </div>

        {shown.length === 0 ? (
          <p className="text-muted">Aucun parfum trouvé.</p>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((f) => (
              <Link
                key={f.id}
                href={`/parfum/${f.slug}`}
                className="group flex flex-col bg-background p-8 transition-colors hover:bg-surface"
              >
                <div className="mx-auto mb-8 w-28 transition-transform duration-700 group-hover:-translate-y-2">
                  <Bottle shape={f.bottleShape} liquidColor={f.liquidColor} capColor={f.capColor} />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{f.brand.name}</p>
                <h3 className="mt-1 font-display text-2xl">{f.name}</h3>
                <p className="mt-3 text-sm text-muted">
                  {f.accords.map((a) => a.accord.name).join(" · ")}
                </p>
                {f._count.dupes > 0 && (
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
                    {f._count.dupes} dupe{f._count.dupes > 1 ? "s" : ""} →
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
