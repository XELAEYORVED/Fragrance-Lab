"use client";

import { useEffect, useRef, useState } from "react";

// Fait apparaître son contenu quand il entre à l'écran.
// Les éléments enfants marqués .reveal-item apparaissent l'un après l'autre (--i = rang),
// et les barres .bar-fill se remplissent à ce moment-là.

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  id?: string;
};

export default function Reveal({ children, className, as: Tag = "div", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      // Navigateur trop ancien : tout est affiché tout de suite
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      id={id}
      data-visible={visible || undefined}
      className={`reveal ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
