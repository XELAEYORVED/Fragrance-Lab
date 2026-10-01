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

    // Pendant le défilement, la réfraction est mise en pause (data-scrolling) pour rester fluide
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (!root.dataset.scrolling) root.dataset.scrolling = "1";
      clearTimeout(timer);
      timer = setTimeout(() => delete root.dataset.scrolling, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      delete root.dataset.scrolling;
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
