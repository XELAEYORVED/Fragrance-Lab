import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getBrands } from "@/lib/api";

export default async function BrandsPage() {
  const brands = await getBrands();

  // Regroupement alphabétique, comme un index
  const groups = new Map<string, typeof brands>();
  for (const brand of brands) {
    const letter = brand.name[0]?.toUpperCase() ?? "#";
    groups.set(letter, [...(groups.get(letter) ?? []), brand]);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-14 pb-20">
      <div className="animate-rise mb-10 px-2">
        <p className="text-sm font-medium text-accent">{brands.length} maisons</p>
        <h1 className="mt-1 text-5xl font-semibold tracking-tight md:text-6xl">Marques</h1>
        <p className="mt-4 max-w-lg text-lg text-muted">
          Les grandes maisons et les créateurs de dupes, réunis au même endroit.
        </p>
      </div>

      <div className="space-y-10">
        {[...groups].map(([letter, list]) => (
          <Reveal as="section" key={letter}>
            <h2 className="mb-3 px-2 text-sm font-semibold text-muted">{letter}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((brand, i) => (
                <div key={brand.id} className="reveal-item" style={{ "--i": i } as React.CSSProperties}>
                <Link
                  href={`/marques/${brand.slug}`}
                  className="glass group flex items-center gap-4 rounded-3xl p-5 transition duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_var(--glass-shadow)] active:scale-[0.99]"
                >
                  <span className="glass-strong flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold">
                    {brand.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold tracking-tight group-hover:text-accent">
                      {brand.name}
                    </span>
                    <span className="block text-sm text-muted">
                      {[brand.country, `${brand._count.fragrances} parfum${brand._count.fragrances > 1 ? "s" : ""}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-accent">→</span>
                </Link>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
