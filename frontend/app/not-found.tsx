import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start px-6 py-32">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="mt-4 font-display text-6xl font-light">Ce parfum s&apos;est évaporé.</h1>
      <Link href="/" className="mt-10 border-b border-accent pb-1 text-sm text-accent">
        Retour au catalogue →
      </Link>
    </main>
  );
}
