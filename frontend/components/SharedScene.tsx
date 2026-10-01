"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useEffect, useState } from "react";

// Durée sans défilement après laquelle la 3D réapparaît (ms)
const SCROLL_IDLE = 160;

// Une seule scène WebGL pour toute la page : chaque vignette 3D (<View>) y réserve sa zone.
// Les navigateurs limitent le nombre de contextes WebGL ; cette scène unique permet d'afficher
// des dizaines de flacons 3D en même temps. Elle laisse passer les clics vers la page.
//
// Pendant un défilement, la scène fixe ne peut pas suivre la page image par image : les flacons
// traîneraient derrière leurs cartes. On affiche donc les photos (qui défilent avec la page) et on
// met la scène en pause, puis la 3D revient en fondu dès que le défilement s'arrête.
export default function SharedScene() {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let scrollingAgain = false;
    const onScroll = () => {
      scrollingAgain = true;
      if (!root.dataset.scrolling) {
        root.dataset.scrolling = "1";
      }
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        // La scène redessine d'abord les flacons à leur nouvelle place, puis réapparaît
        setScrolling(false);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!scrollingAgain) delete root.dataset.scrolling;
          }),
        );
        scrollingAgain = false;
      }, SCROLL_IDLE);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      delete root.dataset.scrolling;
    };
  }, []);

  return (
    <Canvas
      className="shared-scene"
      frameloop={scrolling ? "never" : "always"}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      <View.Port />
    </Canvas>
  );
}
