"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Flacon } from "./Bottle3D";
import PhotoFlacon from "./PhotoFlacon";
import Tilt3D, { type PointerState } from "./Tilt3D";
import type { BottleShape } from "@/lib/api";

export type ThumbSceneProps = {
  imageUrl: string | null;
  shape: BottleShape;
  liquidColor: string;
  capColor: string;
  pointer: React.RefObject<PointerState>;
  motion: boolean;
  onReady: () => void;
};

// Éclairage studio commun à toutes les vignettes : calculé une seule fois, puis partagé.
// (Un éclairage par vignette saturait les unités de texture de la carte graphique.)
let sharedEnvironment: THREE.Texture | null = null;

function getSharedEnvironment(gl: THREE.WebGLRenderer) {
  if (!sharedEnvironment) {
    const pmrem = new THREE.PMREMGenerator(gl);
    sharedEnvironment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  return sharedEnvironment;
}

// Attache l'éclairage partagé comme environnement de la scène de la vignette
function SharedEnvironment() {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => getSharedEnvironment(gl), [gl]);
  return <primitive object={environment} attach="environment" dispose={null} />;
}

// Contenu 3D d'une vignette : caméra, lumière studio et flacon
export default function ThumbScene({ imageUrl, shape, liquidColor, capColor, pointer, motion, onReady }: ThumbSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.15, 7.2]} fov={30} />
      <SharedEnvironment />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <Tilt3D pointer={pointer} motion={motion} maxYaw={0.55} maxPitch={0.28} hoverScale={1.08}>
        {imageUrl ? (
          <Suspense fallback={null}>
            <PhotoFlacon src={imageUrl} shape={shape} maxWidth={2.5} onReady={onReady} textureSize={384} />
          </Suspense>
        ) : (
          <FlaconReady onReady={onReady}>
            <Flacon shape={shape} liquidColor={liquidColor} capColor={capColor} />
          </FlaconReady>
        )}
      </Tilt3D>
    </>
  );
}

// Le flacon générique est prêt dès sa première image
function FlaconReady({ onReady, children }: { onReady: () => void; children: React.ReactNode }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      onReady();
    }
  });
  return <>{children}</>;
}
