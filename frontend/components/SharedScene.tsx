"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

// Une seule scène WebGL pour toute la page : chaque vignette 3D (<View>) y réserve sa zone.
// Les navigateurs limitent le nombre de contextes WebGL ; cette scène unique permet d'afficher
// des dizaines de flacons 3D en même temps. Elle laisse passer les clics vers la page.
export default function SharedScene() {
  return (
    <Canvas
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
