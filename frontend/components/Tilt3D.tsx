"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Position du pointeur sur l'élément suivi, ramenée entre -1 et 1 (mise à jour sans re-rendu)
export type PointerState = { x: number; y: number; active: boolean };

export function createPointer(): PointerState {
  return { x: 0, y: 0, active: false };
}

// Met à jour la position du pointeur à partir d'un événement sur un élément de la page
export function trackPointer(pointer: PointerState, event: PointerEvent | React.PointerEvent, element: Element) {
  const box = element.getBoundingClientRect();
  pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
  pointer.y = ((event.clientY - box.top) / box.height) * 2 - 1;
  pointer.active = true;
}

type Tilt3DProps = {
  pointer: React.RefObject<PointerState>;
  motion: boolean;
  /** Inclinaison maximale (radians) gauche-droite */
  maxYaw?: number;
  /** Inclinaison maximale (radians) haut-bas */
  maxPitch?: number;
  /** Agrandissement quand le pointeur est sur le flacon */
  hoverScale?: number;
  children: React.ReactNode;
};

// Le flacon reste de face et s'incline vers le pointeur, avec un retour souple au repos.
// Sans pointeur, il oscille à peine pour rester vivant.
export default function Tilt3D({
  pointer,
  motion,
  maxYaw = 0.45,
  maxPitch = 0.22,
  hoverScale = 1.05,
  children,
}: Tilt3DProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const group = ref.current;
    const p = pointer.current;
    if (!group || !motion || !p) return;
    const step = Math.min(delta, 1 / 30);
    const t = clock.elapsedTime;

    const yaw = p.active ? p.x * maxYaw : Math.sin(t * 0.5) * 0.06;
    const pitch = p.active ? p.y * maxPitch : Math.sin(t * 0.7) * 0.02;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, 5, step);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pitch, 5, step);
    // Le flacon avance légèrement vers l'écran quand on le survole
    group.position.z = THREE.MathUtils.damp(group.position.z, p.active ? 0.35 : 0, 4, step);
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, p.active ? hoverScale : 1, 5, step));
  });

  return <group ref={ref}>{children}</group>;
}
