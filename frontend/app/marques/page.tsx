import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import Reveal from "@/components/Reveal";
import { getBrands } from "@/lib/api";

// Rendue à la demande (les données restent en cache 5 min) : la compilation n'a pas besoin de joindre l'API
export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-14 pb-20">
      <div className="animate-rise mb-10 px-2">
        <p className="text-sm font-medium text-accent">
          {brands.length} maisons
        </p>
        <h1 className="display mt-1 text-5xl md:text-7xl">
          Marques
        </h1>
        <p className="mt-4 max-w-lg text-lg text-muted">
          Les grandes maisons et les créateurs de dupes, réunis au même endroit.
        </p>
      </div>

      {/* Mur de logos, par ordre alphabétique */}
      <Reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand, i) => (
          <div key={brand.id} className="reveal-item" style={{ "--i": i } as React.CSSProperties}>
            <Link
              href={`/marques/${brand.slug}`}
              className="glass group flex flex-col gap-4 rounded-3xl p-4 transition duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_var(--glass-shadow)] active:scale-[0.99]"
            >
              <BrandLogo
                brand={brand}
                className="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
              <span className="flex items-center gap-3 px-2 pb-1">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold tracking-tight group-hover:text-accent">
                    {brand.name}
                  </span>
                  <span className="block text-sm text-muted">
                    {[
                      brand.country,
                      `${brand._count.fragrances} parfum${brand._count.fragrances > 1 ? "s" : ""}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="text-muted transition duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </span>
            </Link>
          </div>
        ))}
      </Reveal>
    </main>
  );
}
