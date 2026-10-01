import Link from "next/link";
import { notFound } from "next/navigation";
import Bottle from "@/components/Bottle";
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
    <main>
      {/* En-tête du parfum */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 md:grid-cols-[1fr_1.3fr]">
        <div className="relative mx-auto w-52 md:w-64">
          <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft blur-3xl" />
          <Bottle
            shape={fragrance.bottleShape}
            liquidColor={fragrance.liquidColor}
            capColor={fragrance.capColor}
            animated
          />
        </div>
        <div className="animate-rise">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{fragrance.brand.name}</p>
          <h1 className="mt-3 font-display text-6xl font-light md:text-7xl">{fragrance.name}</h1>
          <p className="mt-4 text-sm text-muted">
            {[fragrance.year, genderLabel[fragrance.gender], fragrance.family]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {fragrance.description && (
            <p className="mt-6 max-w-lg leading-relaxed">{fragrance.description}</p>
          )}
          {fragrance.inspiredBy.map(({ id, original }) => (
            <Link
              key={id}
              href={`/parfum/${original.slug}`}
              className="mt-6 inline-block border-b border-accent pb-1 text-sm text-accent"
            >
              Inspiré de {original.brand.name} {original.name} →
            </Link>
          ))}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-4">
            <Stat label="Tenue" value={fragrance.longevity ? `${fragrance.longevity}/10` : "—"} />
            <Stat label="Sillage" value={fragrance.sillage ? `${fragrance.sillage}/10` : "—"} />
            <Stat label="Saisons" value={fragrance.seasons.map((s) => seasonLabel[s]).join(", ")} />
            <Stat label="Moment" value={fragrance.timesOfDay.map((t) => timeLabel[t]).join(", ")} />
          </dl>
        </div>
      </section>

      {/* Pyramide et accords */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 md:grid-cols-2">
          <div>
            <SectionTitle>Pyramide olfactive</SectionTitle>
            <div className="space-y-6">
              {levels.map((level) => (
                <div key={level} className="grid grid-cols-[4rem_1fr] gap-4">
                  <span className="pt-1 text-xs uppercase tracking-[0.2em] text-muted">
                    {levelLabel[level]}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fragrance.notes
                      .filter((n) => n.level === level)
                      .map((n) => (
                        <span key={n.note.slug} className="rounded-full border border-line px-3 py-1 text-sm">
                          {n.note.name}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionTitle>Accords dominants</SectionTitle>
            <AccordBars fragrance={fragrance} />
          </div>
        </div>
      </section>

      {/* Dupes */}
      {dupes.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-accent">Alternatives</p>
          <h2 className="font-display text-5xl font-light">
            {dupes.length} dupe{dupes.length > 1 ? "s" : ""} de {fragrance.name}
          </h2>

          {/* Tableau récapitulatif */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.15em] text-muted">
                <tr className="border-b border-line">
                  <th className="py-4 font-normal">Parfum</th>
                  <th className="py-4 font-normal">Notes communes</th>
                  <th className="py-4 font-normal">Tenue</th>
                  <th className="py-4 font-normal">Sillage</th>
                  <th className="py-4 font-normal">Prix</th>
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
          <div className="mt-20 space-y-16">
            {dupes.map(({ id, dupe, notes }) => (
              <article key={id} className="rounded-sm border border-line bg-surface p-8 md:p-10">
                <header className="mb-10 flex flex-wrap items-center gap-8">
                  <div className="flex items-end gap-4">
                    <Bottle className="w-14" shape={fragrance.bottleShape} liquidColor={fragrance.liquidColor} capColor={fragrance.capColor} />
                    <span className="pb-6 font-display text-2xl text-muted">vs</span>
                    <Bottle className="w-14" shape={dupe.bottleShape} liquidColor={dupe.liquidColor} capColor={dupe.capColor} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{dupe.brand.name}</p>
                    <Link href={`/parfum/${dupe.slug}`} className="font-display text-3xl hover:text-accent">
                      {dupe.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {notes.sharedTotal} notes en commun sur {notes.originalTotal}
                    </p>
                  </div>
                </header>

                <div className="grid gap-12 lg:grid-cols-2">
                  <div className="space-y-6">
                    {notes.byLevel.map(({ level, shared, onlyOriginal, onlyDupe }) => (
                      <div key={level} className="grid grid-cols-[4rem_1fr] gap-4">
                        <span className="pt-1 text-xs uppercase tracking-[0.2em] text-muted">
                          {levelLabel[level]}
                        </span>
                        <div className="flex flex-wrap gap-2 text-sm">
                          {shared.map((n) => (
                            <span key={n} className="rounded-full bg-accent px-3 py-1 text-background">{n}</span>
                          ))}
                          {onlyOriginal.map((n) => (
                            <span key={n} className="rounded-full border border-line px-3 py-1 text-muted line-through decoration-muted/60">{n}</span>
                          ))}
                          {onlyDupe.map((n) => (
                            <span key={n} className="rounded-full border border-dashed border-accent/60 px-3 py-1 text-accent">+ {n}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-muted">
                      <span><span className="mr-2 inline-block size-2 rounded-full bg-accent" />En commun</span>
                      <span><span className="mr-2 inline-block size-2 rounded-full border border-muted" />Absente du dupe</span>
                      <span><span className="mr-2 inline-block size-2 rounded-full border border-dashed border-accent" />Ajoutée par le dupe</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {compareAccords(fragrance, dupe).map((a) => (
                      <div key={a.name}>
                        <div className="mb-1 flex justify-between text-xs text-muted">
                          <span className="text-foreground">{a.name}</span>
                          <span>{Math.round(a.original)} % · {Math.round(a.dupe)} %</span>
                        </div>
                        <div className="h-1 bg-line"><div className="h-full bg-foreground/70" style={{ width: `${a.original}%` }} /></div>
                        <div className="mt-0.5 h-1 bg-line"><div className="h-full bg-accent" style={{ width: `${a.dupe}%` }} /></div>
                      </div>
                    ))}
                    <p className="flex gap-6 pt-2 text-xs text-muted">
                      <span><span className="mr-2 inline-block h-1 w-4 bg-foreground/70 align-middle" />{fragrance.name}</span>
                      <span><span className="mr-2 inline-block h-1 w-4 bg-accent align-middle" />{dupe.name}</span>
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-8 font-display text-3xl font-light">{children}</h2>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-4">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
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
          <div className="h-1 bg-line">
            <div className="h-full bg-accent" style={{ width: `${a.strength}%` }} />
          </div>
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
    <tr className="border-b border-line/60">
      <td className="py-5">
        <Link href={`/parfum/${fragrance.slug}`} className="group flex items-center gap-4">
          <Bottle className="w-7" shape={fragrance.bottleShape} liquidColor={fragrance.liquidColor} capColor={fragrance.capColor} />
          <span>
            <span className="block text-xs text-muted">{fragrance.brand.name}</span>
            <span className="font-display text-xl group-hover:text-accent">{fragrance.name}</span>
          </span>
          {label && (
            <span className="rounded-full border border-accent/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-accent">
              {label}
            </span>
          )}
        </Link>
      </td>
      <td className="py-5">
        {shared ? (
          <div className="flex items-center gap-3">
            <div className="h-1 w-20 bg-line">
              <div className="h-full bg-accent" style={{ width: `${(ratio ?? 0) * 100}%` }} />
            </div>
            <span>{shared}</span>
          </div>
        ) : (
          <span className="text-muted">Référence</span>
        )}
      </td>
      <td className="py-5">{fragrance.longevity ? `${fragrance.longevity}/10` : "—"}</td>
      <td className="py-5">{fragrance.sillage ? `${fragrance.sillage}/10` : "—"}</td>
      <td className="py-5 text-muted">{lowestPrice(fragrance) ?? "Bientôt"}</td>
    </tr>
  );
}
