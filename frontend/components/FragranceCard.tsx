import Link from "next/link";
import Bottle from "@/components/Bottle";
import type { FragranceSummary } from "@/lib/api";

export default function FragranceCard({ fragrance: f }: { fragrance: FragranceSummary }) {
  return (
    <Link
      href={`/parfum/${f.slug}`}
      className="glass group flex flex-col rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1"
    >
      <div className="mx-auto mb-6 w-24 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105">
        <Bottle shape={f.bottleShape} liquidColor={f.liquidColor} capColor={f.capColor} />
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
      {f._count.dupes > 0 && (
        <p className="mt-5 text-sm font-medium text-accent">
          {f._count.dupes} dupe{f._count.dupes > 1 ? "s" : ""} →
        </p>
      )}
    </Link>
  );
}
