"use client";

import { View } from "@react-three/drei";
import { useCallback, useEffect, useRef, useState } from "react";
import StaticBottle from "./StaticBottle";
import ThumbScene from "./ThumbScene";
import { createPointer, trackPointer } from "./Tilt3D";
import type { BottleShape } from "@/lib/api";

// Vignette de flacon en 3D, dessinée dans la scène partagée (SharedScene) : elle s'incline vers la souris.
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
  const onReady = useCallback(() => setReady(true), []);
  const ref = useRef<HTMLDivElement>(null);

  const pointer = useRef(createPointer());

  // Le flacon suit la souris sur toute sa carte (élément .group le plus proche), pas seulement sur l'image
  useEffect(() => {
    const target = ref.current?.closest<HTMLElement>(".group") ?? ref.current;
    if (!target) return;
    const move = (event: PointerEvent) => trackPointer(pointer.current, event, target);
    const leave = () => {
      pointer.current.active = false;
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerleave", leave);
    return () => {
      target.removeEventListener("pointermove", move);
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
            pointer={pointer}
            motion={motion}
            onReady={onReady}
          />
        </View>
      )}
    </div>
  );
}
