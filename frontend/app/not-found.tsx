import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-24">
      <div className="glass rounded-[2.5rem] p-12">
        <p className="text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight">Ce parfum s&apos;est évaporé.</h1>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          Retour au catalogue
        </Link>
      </div>
    </main>
  );
}
