import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import FragranceCard from "@/components/FragranceCard";
import Reveal from "@/components/Reveal";
import { getBrand } from "@/lib/api";

export default async function BrandPage({ params }: PageProps<"/marques/[slug]">) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 pb-20">
      <section className="glass animate-rise mb-8 flex flex-wrap items-center gap-6 rounded-[2.5rem] p-8 md:p-12">
        <BrandLogo brand={brand} size="lg" />
        <div className="flex-1">
          <Link href="/marques" className="text-sm text-muted hover:text-foreground">
            ← Marques
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{brand.name}</h1>
          <p className="mt-1 text-muted">
            {[brand.country, `${brand.fragrances.length} parfum${brand.fragrances.length > 1 ? "s" : ""}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </section>

      <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brand.fragrances.map((f, i) => (
          <div key={f.id} className="reveal-item" style={{ "--i": i } as React.CSSProperties}>
            <FragranceCard fragrance={f} />
          </div>
        ))}
      </Reveal>
    </main>
  );
}
