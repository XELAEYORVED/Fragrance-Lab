import Link from "next/link";
import { notFound } from "next/navigation";
import BottleThumb from "@/components/BottleThumb";
import BrandLogo from "@/components/BrandLogo";
import BottleViewer from "@/components/BottleViewer";
import Reveal from "@/components/Reveal";
import {
  genderLabel,
  savings,
  getFragrance,
  levelLabel,
  seasonLabel,
  timeLabel,
  type FragranceProfile,
} from "@/lib/api";
import { compareAccords, compareNotes, displayPrice, levels } from "@/lib/compare";

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
        <Reveal className="glass relative overflow-hidden rounded-[2.5rem]">
          <BottleViewer
            className="aspect-[4/5] w-full"
            shape={fragrance.bottleShape}
            liquidColor={fragrance.liquidColor}
            capColor={fragrance.capColor}
            imageUrl={fragrance.imageUrl}
          />
          <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-xs text-muted">
            Faites tourner le flacon · molette pour zoomer
          </p>
        </Reveal>
        <Reveal className="glass rounded-[2.5rem] p-8 md:p-12">
          <Link
            href={`/marques/${fragrance.brand.slug}`}
            className="group inline-flex items-center gap-3 text-sm font-medium text-accent"
          >
            <BrandLogo brand={fragrance.brand} size="sm" className="transition-transform duration-300 group-hover:scale-105" />
            {fragrance.brand.name}
          </Link>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight md:text-6xl">{fragrance.name}</h1>
          <p className="mt-3 text-sm text-muted">
            {[fragrance.year, fragrance.gender && genderLabel[fragrance.gender], fragrance.family]
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
            <Stat index={0} label="Tenue" value={fragrance.longevity ? `${fragrance.longevity}/10` : "—"} />
            <Stat index={1} label="Sillage" value={fragrance.sillage ? `${fragrance.sillage}/10` : "—"} />
            <Stat index={2} label="Saisons" value={fragrance.seasons.map((s) => seasonLabel[s]).join(", ")} />
            <Stat index={3} label="Moment" value={fragrance.timesOfDay.map((t) => timeLabel[t]).join(", ")} />
            <Stat
              index={4}
              label="Prix indicatif · 100 ml"
              value={displayPrice(fragrance) ?? "—"}
              className="col-span-2 sm:col-span-4"
            />
          </dl>
        </Reveal>
      </section>

      {/* Pyramide et accords */}
      <section className={`grid gap-4 ${fragrance.accords.length > 0 ? "md:grid-cols-2" : ""}`}>
        <Reveal className="glass rounded-[2.5rem] p-8 md:p-10">
          <SectionTitle>Pyramide olfactive</SectionTitle>
          <div className="space-y-5">
            {levels.map((level, li) => (
              <div key={level} className="grid grid-cols-[3.5rem_1fr] gap-3">
                <span className="pt-1.5 text-xs font-medium text-muted">{levelLabel[level]}</span>
                <div className="flex flex-wrap gap-2">
                  {fragrance.notes
                    .filter((n) => n.level === level)
                    .map((n, j) => (
                      <span key={n.note.slug} className="glass-pill reveal-item px-3 py-1 text-sm" style={{ "--i": li * 3 + j } as React.CSSProperties}>
                        {n.note.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        {/* Les accords ne sont affichés que lorsqu'une source fiable les donne */}
        {fragrance.accords.length > 0 && (
          <Reveal className="glass rounded-[2.5rem] p-8 md:p-10">
            <SectionTitle>Accords dominants</SectionTitle>
            <AccordBars fragrance={fragrance} />
          </Reveal>
        )}
      </section>

      {/* Dupes */}
      {dupes.length > 0 && (
        <section className="space-y-4 pt-12">
          <Reveal className="px-2">
            <p className="text-sm font-medium text-accent">Alternatives</p>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight">
              {dupes.length} dupe{dupes.length > 1 ? "s" : ""} de {fragrance.name}
            </h2>
          </Reveal>

          {/* Tableau récapitulatif */}
          <Reveal className="glass overflow-x-auto rounded-[2rem] px-6 py-2">
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
                <SummaryRow index={0} fragrance={fragrance} label="Original" />
                {dupes.map(({ id, dupe, notes }, i) => (
                  <SummaryRow
                    key={id}
                    index={i + 1}
                    saved={savings(fragrance, dupe)}
                    fragrance={dupe}
                    shared={`${notes.sharedTotal} / ${notes.originalTotal}`}
                    ratio={notes.sharedTotal / notes.originalTotal}
                  />
                ))}
              </tbody>
            </table>
          </Reveal>

          {/* Comparaison détaillée */}
          {dupes.map(({ id, dupe, notes }) => (
            <Reveal as="article" key={id} className="glass rounded-[2.5rem] p-8 md:p-10">
              <header className="mb-8 flex flex-wrap items-center gap-6">
                <div className="flex items-end gap-3">
                  <BottleThumb className="w-16" fragrance={fragrance} />
                  <span className="pb-5 text-sm text-muted">vs</span>
                  <BottleThumb className="w-16" fragrance={dupe} />
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

              <div className={`grid gap-10 ${fragrance.accords.length && dupe.accords.length ? "lg:grid-cols-2" : ""}`}>
                <div className="space-y-5">
                  {notes.byLevel.map(({ level, shared, onlyOriginal, onlyDupe }, li) => (
                    <div key={level} className="grid grid-cols-[3.5rem_1fr] gap-3">
                      <span className="pt-1.5 text-xs font-medium text-muted">{levelLabel[level]}</span>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {shared.map((n) => (
                          <span key={n} className="reveal-item rounded-full bg-accent px-3 py-1 text-white dark:text-background" style={{ "--i": li * 4 } as React.CSSProperties}>{n}</span>
                        ))}
                        {onlyOriginal.map((n) => (
                          <span key={n} className="glass-pill reveal-item px-3 py-1 text-muted line-through" style={{ "--i": li * 4 + 1 } as React.CSSProperties}>{n}</span>
                        ))}
                        {onlyDupe.map((n) => (
                          <span key={n} className="reveal-item rounded-full border border-dashed border-accent px-3 py-1 text-accent" style={{ "--i": li * 4 + 2 } as React.CSSProperties}>+ {n}</span>
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

                {fragrance.accords.length > 0 && dupe.accords.length > 0 && (
                <div className="space-y-3">
                  {compareAccords(fragrance, dupe).map((a, i) => (
                    <div key={a.name}>
                      <div className="mb-1 flex justify-between text-xs text-muted">
                        <span className="text-foreground">{a.name}</span>
                        <span>{Math.round(a.original)} % · {Math.round(a.dupe)} %</span>
                      </div>
                      <Bar index={i} value={a.original} className="bg-foreground/60" />
                      <div className="mt-1">
                        <Bar index={i + 1} value={a.dupe} className="bg-accent" />
                      </div>
                    </div>
                  ))}
                  <p className="flex gap-5 pt-1 text-xs text-muted">
                    <span><span className="mr-1.5 inline-block h-1.5 w-4 rounded-full bg-foreground/60 align-middle" />{fragrance.name}</span>
                    <span><span className="mr-1.5 inline-block h-1.5 w-4 rounded-full bg-accent align-middle" />{dupe.name}</span>
                  </p>
                </div>
                )}
              </div>
            </Reveal>
          ))}
        </section>
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-2xl font-semibold tracking-tight">{children}</h2>;
}

function Stat({ label, value, index, className }: { label: string; value: string; index: number; className?: string }) {
  return (
    <div className={`glass-strong reveal-item rounded-2xl px-4 py-3 ${className ?? ""}`} style={{ "--i": index + 4 } as React.CSSProperties}>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function Bar({ value, className, index = 0 }: { value: number; className: string; index?: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line">
      <div
        className={`bar-fill h-full rounded-full ${className}`}
        style={{ width: `${value}%`, "--i": index } as React.CSSProperties}
      />
    </div>
  );
}

function AccordBars({ fragrance }: { fragrance: FragranceProfile }) {
  return (
    <div className="space-y-4">
      {fragrance.accords.map((a, i) => (
        <div key={a.accord.slug}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span>{a.accord.name}</span>
            <span className="text-muted">{Math.round(a.strength)} %</span>
          </div>
          <Bar index={i} value={a.strength} className="bg-gradient-to-r from-accent to-[var(--blob-2)]" />
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
  index,
  saved,
}: {
  index: number;
  saved?: number | null;
  fragrance: FragranceProfile;
  label?: string;
  shared?: string;
  ratio?: number;
}) {
  return (
    <tr className="reveal-item border-b border-line last:border-0" style={{ "--i": index * 2 } as React.CSSProperties}>
      <td className="py-4">
        <Link href={`/parfum/${fragrance.slug}`} className="group flex items-center gap-3">
          <BottleThumb className="w-10" fragrance={fragrance} />
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
              <Bar index={index * 2 + 2} value={(ratio ?? 0) * 100} className="bg-accent" />
            </div>
            <span>{shared}</span>
          </div>
        ) : (
          <span className="text-muted">Référence</span>
        )}
      </td>
      <td className="py-4">{fragrance.longevity ? `${fragrance.longevity}/10` : "—"}</td>
      <td className="py-4">{fragrance.sillage ? `${fragrance.sillage}/10` : "—"}</td>
      <td className="py-4">
        {displayPrice(fragrance) ?? <span className="text-muted">—</span>}
        {saved != null && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-white dark:text-background">−{saved} %</span>}
      </td>
    </tr>
  );
}
