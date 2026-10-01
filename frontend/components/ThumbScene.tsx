"use client";

import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Flacon } from "./Bottle3D";
import PhotoFlacon from "./PhotoFlacon";
import type { BottleShape } from "@/lib/api";

export type ThumbSceneProps = {
  imageUrl: string | null;
  shape: BottleShape;
  liquidColor: string;
  capColor: string;
  hover: boolean;
  motion: boolean;
  onReady: () => void;
};

// Rotation lente en continu, plus rapide et légèrement agrandie au survol
function Spin({ hover, motion, children }: { hover: boolean; motion: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const speed = useRef(0);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group || !motion) return;
    const step = Math.min(delta, 1 / 30);
    speed.current = THREE.MathUtils.damp(speed.current, hover ? 2.4 : 0.45, 4, step);
    group.rotation.y += speed.current * step;
    const scale = THREE.MathUtils.damp(group.scale.x, hover ? 1.06 : 1, 6, step);
    group.scale.setScalar(scale);
  });

  return <group ref={ref}>{children}</group>;
}

// Contenu 3D d'une vignette : caméra, lumière studio et flacon
export default function ThumbScene({ imageUrl, shape, liquidColor, capColor, hover, motion, onReady }: ThumbSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.15, 7.2]} fov={30} />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={5} position={[-2.5, 0.5, 3]} scale={[0.35, 7, 1]} />
        <Lightformer intensity={3} position={[2.2, 0.5, 3]} scale={[0.2, 7, 1]} />
        <Lightformer intensity={1.5} color={liquidColor} position={[0, -3, -4]} scale={[12, 4, 1]} />
      </Environment>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <Spin hover={hover} motion={motion}>
        {imageUrl ? (
          <Suspense fallback={null}>
            <PhotoFlacon src={imageUrl} shape={shape} maxWidth={2.5} onReady={onReady} />
          </Suspense>
        ) : (
          <FlaconReady onReady={onReady}>
            <Flacon shape={shape} liquidColor={liquidColor} capColor={capColor} />
          </FlaconReady>
        )}
      </Spin>
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
