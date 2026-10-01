import Link from "next/link";
import { notFound } from "next/navigation";
import Bottle from "@/components/Bottle";
import BottleViewer from "@/components/BottleViewer";
import {
  genderLabel,
  getFragrance,
  levelLabel,
  seasonLabel,
  timeLabel,
  type FragranceProfile,
} from "@/lib/api";
import { compareAccords, compareNotes, levels, lowestPrice } from "@/lib/compare";

export default async function FragrancePage({ params }: PageProps<"/parfum/[slug]">) {
  const { slug } = await params;
  const fragrance = await getFragrance(slug);
  if (!fragrance) notFound();

  const dupes = fragrance.dupes
    .map(({ id, dupe }) => ({ id, dupe, notes: compareNotes(fragrance, dupe) }))
    .sort((a, b) => b.notes.sharedTotal - a.notes.sharedTotal);

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 pt-10 pb-20">
      {/* En-tête du parfum */}
      <section className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div className="glass relative overflow-hidden rounded-[2.5rem]">
          <BottleViewer
            className="aspect-[4/5] w-full"
            shape={fragrance.bottleShape}
            liquidColor={fragrance.liquidColor}
            capColor={fragrance.capColor}
          />
          <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs text-muted">
            Faites pivoter · molette pour zoomer
          </p>
        </div>
        <div className="glass animate-rise rounded-[2.5rem] p-8 md:p-12">
          <Link href={`/marques/${fragrance.brand.slug}`} className="text-sm font-medium text-accent">
            {fragrance.brand.name}
          </Link>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight md:text-6xl">{fragrance.name}</h1>
          <p className="mt-3 text-sm text-muted">
            {[fragrance.year, genderLabel[fragrance.gender], fragrance.family]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {fragrance.description && (
            <p className="mt-5 max-w-lg leading-relaxed">{fragrance.description}</p>
          )}
          {fragrance.inspiredBy.map(({ id, original }) => (
            <Link
              key={id}
              href={`/parfum/${original.slug}`}
              className="glass-pill mt-5 mr-2 inline-block px-4 py-2 text-sm font-medium"
            >
              Inspiré de {original.brand.name} {original.name} →
            </Link>
          ))}
          <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Tenue" value={fragrance.longevity ? `${fragrance.longevity}/10` : "—"} />
            <Stat label="Sillage" value={fragrance.sillage ? `${fragrance.sillage}/10` : "—"} />
            <Stat label="Saisons" value={fragrance.seasons.map((s) => seasonLabel[s]).join(", ")} />
            <Stat label="Moment" value={fragrance.timesOfDay.map((t) => timeLabel[t]).join(", ")} />
          </dl>
        </div>
      </section>

      {/* Pyramide et accords */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-[2.5rem] p-8 md:p-10">
          <SectionTitle>Pyramide olfactive</SectionTitle>
          <div className="space-y-5">
            {levels.map((level) => (
              <div key={level} className="grid grid-cols-[3.5rem_1fr] gap-3">
                <span className="pt-1.5 text-xs font-medium text-muted">{levelLabel[level]}</span>
                <div className="flex flex-wrap gap-2">
                  {fragrance.notes
                    .filter((n) => n.level === level)
                    .map((n) => (
                      <span key={n.note.slug} className="glass-pill px-3 py-1 text-sm">
                        {n.note.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-[2.5rem] p-8 md:p-10">
          <SectionTitle>Accords dominants</SectionTitle>
          <AccordBars fragrance={fragrance} />
        </div>
      </section>

      {/* Dupes */}
      {dupes.length > 0 && (
        <section className="space-y-4 pt-12">
          <div className="px-2">
            <p className="text-sm font-medium text-accent">Alternatives</p>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight">
              {dupes.length} dupe{dupes.length > 1 ? "s" : ""} de {fragrance.name}
            </h2>
          </div>

          {/* Tableau récapitulatif */}
          <div className="glass overflow-x-auto rounded-[2rem] px-6 py-2">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="py-4 font-medium">Parfum</th>
                  <th className="py-4 font-medium">Notes communes</th>
                  <th className="py-4 font-medium">Tenue</th>
                  <th className="py-4 font-medium">Sillage</th>
                  <th className="py-4 font-medium">Prix</th>
                </tr>
              </thead>
              <tbody>
                <SummaryRow fragrance={fragrance} label="Original" />
                {dupes.map(({ id, dupe, notes }) => (
                  <SummaryRow
                    key={id}
                    fragrance={dupe}
                    shared={`${notes.sharedTotal} / ${notes.originalTotal}`}
                    ratio={notes.sharedTotal / notes.originalTotal}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparaison détaillée */}
          {dupes.map(({ id, dupe, notes }) => (
            <article key={id} className="glass rounded-[2.5rem] p-8 md:p-10">
              <header className="mb-8 flex flex-wrap items-center gap-6">
                <div className="flex items-end gap-3">
                  <Bottle className="w-12" shape={fragrance.bottleShape} liquidColor={fragrance.liquidColor} capColor={fragrance.capColor} />
                  <span className="pb-5 text-sm text-muted">vs</span>
                  <Bottle className="w-12" shape={dupe.bottleShape} liquidColor={dupe.liquidColor} capColor={dupe.capColor} />
                </div>
                <div>
                  <p className="text-xs text-muted">{dupe.brand.name}</p>
                  <Link href={`/parfum/${dupe.slug}`} className="text-2xl font-semibold tracking-tight hover:text-accent">
                    {dupe.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {notes.sharedTotal} notes en commun sur {notes.originalTotal}
                  </p>
                </div>
              </header>

              <div className="grid gap-10 lg:grid-cols-2">
                <div className="space-y-5">
                  {notes.byLevel.map(({ level, shared, onlyOriginal, onlyDupe }) => (
                    <div key={level} className="grid grid-cols-[3.5rem_1fr] gap-3">
                      <span className="pt-1.5 text-xs font-medium text-muted">{levelLabel[level]}</span>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {shared.map((n) => (
                          <span key={n} className="rounded-full bg-accent px-3 py-1 text-white dark:text-background">{n}</span>
                        ))}
                        {onlyOriginal.map((n) => (
                          <span key={n} className="glass-pill px-3 py-1 text-muted line-through">{n}</span>
                        ))}
                        {onlyDupe.map((n) => (
                          <span key={n} className="rounded-full border border-dashed border-accent px-3 py-1 text-accent">+ {n}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs text-muted">
                    <span><span className="mr-1.5 inline-block size-2 rounded-full bg-accent" />En commun</span>
                    <span><span className="mr-1.5 inline-block size-2 rounded-full border border-muted" />Absente du dupe</span>
                    <span><span className="mr-1.5 inline-block size-2 rounded-full border border-dashed border-accent" />Ajoutée par le dupe</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {compareAccords(fragrance, dupe).map((a) => (
                    <div key={a.name}>
                      <div className="mb-1 flex justify-between text-xs text-muted">
                        <span className="text-foreground">{a.name}</span>
                        <span>{Math.round(a.original)} % · {Math.round(a.dupe)} %</span>
                      </div>
                      <Bar value={a.original} className="bg-foreground/60" />
                      <Bar value={a.dupe} className="mt-1 bg-accent" />
                    </div>
                  ))}
                  <p className="flex gap-5 pt-1 text-xs text-muted">
                    <span><span className="mr-1.5 inline-block h-1.5 w-4 rounded-full bg-foreground/60 align-middle" />{fragrance.name}</span>
                    <span><span className="mr-1.5 inline-block h-1.5 w-4 rounded-full bg-accent align-middle" />{dupe.name}</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-2xl font-semibold tracking-tight">{children}</h2>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-strong rounded-2xl px-4 py-3">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function Bar({ value, className }: { value: number; className: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function AccordBars({ fragrance }: { fragrance: FragranceProfile }) {
  return (
    <div className="space-y-4">
      {fragrance.accords.map((a) => (
        <div key={a.accord.slug}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{a.accord.name}</span>
            <span className="text-muted">{Math.round(a.strength)} %</span>
          </div>
          <Bar value={a.strength} className="bg-gradient-to-r from-accent to-[var(--blob-2)]" />
        </div>
      ))}
    </div>
  );
}

function SummaryRow({
  fragrance,
  label,
  shared,
  ratio,
}: {
  fragrance: FragranceProfile;
  label?: string;
  shared?: string;
  ratio?: number;
}) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-4">
        <Link href={`/parfum/${fragrance.slug}`} className="group flex items-center gap-3">
          <Bottle className="w-7" shape={fragrance.bottleShape} liquidColor={fragrance.liquidColor} capColor={fragrance.capColor} />
          <span>
            <span className="block text-xs text-muted">{fragrance.brand.name}</span>
            <span className="font-semibold group-hover:text-accent">{fragrance.name}</span>
          </span>
          {label && <span className="glass-pill px-2.5 py-0.5 text-[11px] font-medium text-accent">{label}</span>}
        </Link>
      </td>
      <td className="py-4">
        {shared ? (
          <div className="flex items-center gap-3">
            <div className="w-20">
              <Bar value={(ratio ?? 0) * 100} className="bg-accent" />
            </div>
            <span>{shared}</span>
          </div>
        ) : (
          <span className="text-muted">Référence</span>
        )}
      </td>
      <td className="py-4">{fragrance.longevity ? `${fragrance.longevity}/10` : "—"}</td>
      <td className="py-4">{fragrance.sillage ? `${fragrance.sillage}/10` : "—"}</td>
      <td className="py-4 text-muted">{lowestPrice(fragrance) ?? "Bientôt"}</td>
    </tr>
  );
}
