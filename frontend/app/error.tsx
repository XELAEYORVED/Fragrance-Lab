"use client";

import { useEffect, useState } from "react";

// Page affichée si l'API ne répond pas (par exemple pendant son réveil sur Render) :
// un message calme et un nouvel essai automatique au bout de quelques secondes.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const [seconds, setSeconds] = useState(8);

  useEffect(() => {
    if (seconds <= 0) {
      reset();
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, reset]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-32 text-center">
      <div className="glass glass-lens rounded-[3rem] px-8 py-16">
        <p className="text-lg font-semibold text-accent">Un instant</p>
        <h1 className="display mt-3 text-4xl md:text-6xl">Le site se réveille.</h1>
        <p className="mx-auto mt-5 max-w-md text-[17px] text-muted">
          Le catalogue était en veille. Nouvel essai dans {seconds} s…
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-full bg-accent px-6 py-3 text-[17px] font-medium text-white transition hover:brightness-110 active:scale-95"
        >
          Réessayer maintenant
        </button>
      </div>
    </main>
  );
}
