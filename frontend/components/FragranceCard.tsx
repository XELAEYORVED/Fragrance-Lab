import Link from "next/link";
import BottleThumb from "@/components/BottleThumb";
import { priceRange, type FragranceSummary } from "@/lib/api";

// Tuile produit façon apple.com : flacon en grand, nom, prix et lien d'action
export default function FragranceCard({ fragrance: f }: { fragrance: FragranceSummary }) {
  const price = priceRange(f);

  return (
    <Link
      href={`/parfum/${f.slug}`}
      className="glass group flex h-full flex-col items-center rounded-[2rem] px-6 pt-8 pb-7 text-center transition duration-500 ease-out hover:-translate-y-1 active:scale-[0.99]"
    >
      <div className="mb-6 w-36 transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.04]">
        <BottleThumb fragrance={f} />
      </div>
      <p className="text-xs text-muted">{f.brand.name}</p>
      <h3 className="mt-0.5 text-[21px] leading-tight font-semibold tracking-tight">{f.name}</h3>
      {f.accords.length > 0 && (
        <p className="mt-2 text-sm text-muted">{f.accords.map((a) => a.accord.name).join(" · ")}</p>
      )}
      <div className="mt-auto pt-5">
        {price && (
          <p className="text-[15px]">
            {price} <span className="text-xs text-muted">· indicatif</span>
          </p>
        )}
        <p className="mt-1.5 text-[15px] text-accent group-hover:underline">
          {f._count.dupes > 0 ? `Voir ${f._count.dupes > 1 ? `les ${f._count.dupes} dupes` : "le dupe"} ›` : "Découvrir ›"}
        </p>
      </div>
    </Link>
  );
}
