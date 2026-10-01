import Link from "next/link";
import BottleThumb from "@/components/BottleThumb";
import { priceRange, type FragranceSummary } from "@/lib/api";

export default function FragranceCard({ fragrance: f }: { fragrance: FragranceSummary }) {
  return (
    <Link
      href={`/parfum/${f.slug}`}
      className="glass group flex h-full flex-col rounded-[2rem] p-7 transition duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_var(--glass-shadow)] active:scale-[0.99]"
    >
      <div className="mx-auto -mt-2 mb-1 w-40 transition-transform duration-700 ease-out group-hover:-translate-y-1">
        <BottleThumb fragrance={f} />
      </div>
      <p className="text-xs text-muted">{f.brand.name}</p>
      <h3 className="text-xl font-semibold tracking-tight">{f.name}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {f.accords.map((a) => (
          <span key={a.accord.slug} className="glass-pill px-2.5 py-0.5 text-xs text-muted">
            {a.accord.name}
          </span>
        ))}
      </div>
      {priceRange(f) && (
        <p className="mt-4 text-sm">
          {priceRange(f)} <span className="text-xs text-muted">· indicatif, 100 ml</span>
        </p>
      )}
      {f._count.dupes > 0 && (
        <p className="mt-5 text-sm font-medium text-accent">
          {f._count.dupes} dupe{f._count.dupes > 1 ? "s" : ""}{" "}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      )}
    </Link>
  );
}
