"use client";

import { View } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import StaticBottle from "./StaticBottle";
import ThumbScene from "./ThumbScene";
import type { BottleShape } from "@/lib/api";

// Vignette de flacon en 3D, dessinée dans la scène partagée (SharedScene).
// L'image fixe reste affichée jusqu'à ce que le modèle 3D soit prêt, puis s'efface.

type BottleThumbProps = {
  fragrance: {
    name: string;
    imageUrl: string | null;
    bottleShape: BottleShape;
    liquidColor: string;
    capColor: string;
  };
  className?: string;
};

let webglSupport: boolean | null = null;
function supportsWebGL() {
  if (webglSupport === null) {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  }
  return webglSupport;
}

export default function BottleThumb({ fragrance, className }: BottleThumbProps) {
  const [enabled, setEnabled] = useState(false);
  const [motion, setMotion] = useState(true);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const ref = useRef<HTMLDivElement>(null);

  // Le flacon réagit au survol de toute sa carte (élément .group le plus proche), pas seulement de l'image
  useEffect(() => {
    const target = ref.current?.closest<HTMLElement>(".group") ?? ref.current;
    if (!target) return;
    const enter = () => setHover(true);
    const leave = () => setHover(false);
    target.addEventListener("pointerenter", enter);
    target.addEventListener("pointerleave", leave);
    return () => {
      target.removeEventListener("pointerenter", enter);
      target.removeEventListener("pointerleave", leave);
    };
  }, []);

  // La 3D ne démarre qu'une fois la page affichée dans le navigateur
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEnabled(supportsWebGL());
      setMotion(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={ref} className={`relative aspect-[3/4] ${className ?? ""}`}>
      {/* Même cadrage que la caméra 3D (le flacon occupe environ deux tiers de la hauteur) */}
      <div
        className={`absolute inset-x-0 inset-y-[16%] transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <StaticBottle fragrance={fragrance} className="size-full" />
      </div>
      {enabled && (
        <View className="absolute inset-0">
          <ThumbScene
            imageUrl={fragrance.imageUrl}
            shape={fragrance.bottleShape}
            liquidColor={fragrance.liquidColor}
            capColor={fragrance.capColor}
            hover={hover}
            motion={motion}
            onReady={onReady}
          />
        </View>
      )}
    </div>
  );
}
