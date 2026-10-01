"use client";

import { useEffect } from "react";
import { REFRACTION_MAP } from "./refraction-map";

// Filtres SVG du Liquid Glass : l'arrière-plan du verre est déplacé selon une carte de réfraction
// (neutre au centre, courbée près des bords), comme à travers une lentille épaisse.
// Les navigateurs Chromium appliquent ces filtres à backdrop-filter ; Safari et Firefox ne le font pas
// et gardent un verre dépoli classique (la classe « refraction » n'est posée que sur Chromium).
export default function LiquidGlassFilter() {
  useEffect(() => {
    const root = document.documentElement;
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands;
    if (brands?.some((b) => b.brand === "Chromium")) root.classList.add("refraction");

    // Le reflet du verre suit le pointeur (une mise à jour par image au plus)
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--lx", `${event.clientX}px`);
        root.style.setProperty("--ly", `${event.clientY}px`);
        frame = 0;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      root.classList.remove("refraction");
    };
  }, []);

  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {/* Verre clair : forte réfraction (navigation, boutons, pastilles) */}
        <filter id="liquid-glass" x="0" y="0" width="100%" height="100%" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feImage href={REFRACTION_MAP} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.12" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Verre dépoli : réfraction plus douce (cartes et panneaux) */}
        <filter id="liquid-glass-soft" x="0" y="0" width="100%" height="100%" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
          <feImage href={REFRACTION_MAP} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="0.06" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
