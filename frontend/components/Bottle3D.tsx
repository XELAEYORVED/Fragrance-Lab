"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { BottleShape } from "@/lib/api";
import PhotoFlacon from "./PhotoFlacon";

// Scène 3D du flacon : reconstruit depuis sa photo si elle existe, sinon généré
// à partir de la forme et des couleurs du parfum

export type Bottle3DProps = {
  shape: BottleShape;
  liquidColor: string;
  capColor: string;
  imageUrl?: string | null;
};

type Dims = { width: number; height: number; depth: number };

const dims: Record<BottleShape, Dims> = {
  RECTANGLE: { width: 1.3, height: 1.7, depth: 0.6 },
  SQUARE: { width: 1.45, height: 1.45, depth: 0.95 },
  CYLINDER: { width: 1.1, height: 1.9, depth: 1.1 },
  ROUND: { width: 1.7, height: 1.6, depth: 0.9 },
  PEBBLE: { width: 1.75, height: 1.35, depth: 0.95 },
  FACETED: { width: 1.45, height: 1.55, depth: 1.45 },
};

// Volume du flacon, réutilisé (réduit) pour le jus
function BodyGeometry({ shape, inset = 0 }: { shape: BottleShape; inset?: number }) {
  const { width, height, depth } = dims[shape];
  const w = width - inset;
  const h = height - inset;
  const d = depth - inset;

  switch (shape) {
    case "CYLINDER":
      return <cylinderGeometry args={[w / 2, w / 2, h, 64]} />;
    case "FACETED":
      return <cylinderGeometry args={[w / 2, w / 2, h, 8]} />;
    case "ROUND":
    case "PEBBLE":
      return <sphereGeometry args={[0.5, 64, 64]} />;
    default:
      return <boxGeometry args={[w, h, d]} />;
  }
}

function Body({ shape, inset, children }: { shape: BottleShape; inset?: number; children: React.ReactNode }) {
  const { width, height, depth } = dims[shape];
  const k = inset ?? 0;

  // Les formes arrondies sont des sphères étirées
  if (shape === "ROUND" || shape === "PEBBLE") {
    return (
      <mesh scale={[width - k, height - k, depth - k]}>
        <BodyGeometry shape={shape} />
        {children}
      </mesh>
    );
  }
  if (shape === "RECTANGLE" || shape === "SQUARE") {
    return (
      <RoundedBox args={[width - k, height - k, depth - k]} radius={0.1} smoothness={6}>
        {children}
      </RoundedBox>
    );
  }
  return (
    <mesh rotation={shape === "FACETED" ? [0, Math.PI / 8, 0] : undefined}>
      <BodyGeometry shape={shape} inset={k} />
      {children}
    </mesh>
  );
}

function Cap({ shape, color, y }: { shape: BottleShape; color: string; y: number }) {
  const material = (
    <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} />
  );
  if (shape === "RECTANGLE" || shape === "SQUARE") {
    return (
      <RoundedBox args={[0.62, 0.55, 0.5]} radius={0.06} smoothness={4} position={[0, y + 0.275, 0]}>
        {material}
      </RoundedBox>
    );
  }
  return (
    <mesh position={[0, y + 0.3, 0]}>
      <cylinderGeometry args={[0.32, 0.32, 0.6, shape === "FACETED" ? 8 : 48]} />
      {material}
    </mesh>
  );
}

function Flacon({ shape, liquidColor, capColor }: Bottle3DProps) {
  const { height } = dims[shape];
  const top = height / 2;

  // Le jus s'arrête sous l'épaule du flacon
  const fillLevel = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), top - height * 0.16), [top, height]);

  return (
    <group position={[0, -0.35, 0]}>
      {/* Jus, légèrement surélevé pour simuler l'épaisseur du fond en verre */}
      <group position={[0, 0.05, 0]}>
        <Body shape={shape} inset={0.2}>
          <meshPhysicalMaterial
            color={liquidColor}
            emissive={liquidColor}
            emissiveIntensity={0.18}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            clippingPlanes={[fillLevel]}
            side={THREE.DoubleSide}
          />
        </Body>
      </group>

      {/* Verre : coque translucide très réfléchissante */}
      <Body shape={shape}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.22}
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={2.8}
          depthWrite={false}
        />
      </Body>

      {/* Col doré */}
      <mesh position={[0, top + 0.08, 0]}>
        <cylinderGeometry args={[0.15, 0.17, 0.16, 32]} />
        <meshStandardMaterial color="#d4b06a" metalness={1} roughness={0.2} />
      </mesh>

      <Cap shape={shape} color={capColor} y={top + 0.16} />
    </group>
  );
}

// Entrée en scène : le flacon monte, grandit et pivote jusqu'à faire face
function Intro({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = ref.current;
    if (!group) return;
    const step = Math.min(delta, 1 / 30);
    group.position.y = THREE.MathUtils.damp(group.position.y, 0, 3.2, step);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, 0, 2.6, step);
    const scale = THREE.MathUtils.damp(group.scale.x, 1, 3.6, step);
    group.scale.setScalar(scale);
  });

  return (
    <group
      ref={ref}
      position={[0, enabled ? -0.7 : 0, 0]}
      rotation={[0, enabled ? -Math.PI * 0.85 : 0, 0]}
      scale={enabled ? 0.82 : 1}
    >
      {children}
    </group>
  );
}

// Bande de lumière qui balaie le verre toutes les quelques secondes, comme sur une photo produit
function Glint({ enabled }: { enabled: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const PERIOD = 6.5;
  const SWEEP = 1.8;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.elapsedTime + 1.2) % PERIOD;
    const progress = enabled && t < SWEEP ? t / SWEEP : -1;
    // Accélération puis ralentissement (easeInOutCubic)
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    ref.current.position.x = progress < 0 ? -9 : -6 + eased * 12;
  });

  return <Lightformer ref={ref} intensity={9} position={[-9, 0.5, 3.5]} rotation-z={0.35} scale={[0.6, 9, 1]} />;
}

// Rotation automatique qui s'arrête dès qu'on attrape le flacon et reprend en douceur ensuite
function Controls({ enabled }: { enabled: boolean }) {
  const ref = useRef<OrbitControlsImpl>(null);
  const resumeAt = useRef(0); // horodatage (ms) à partir duquel la rotation reprend
  const SPEED = 1.1;
  const RESUME_DELAY = 2500;

  useFrame((_, delta) => {
    const controls = ref.current;
    if (!controls) return;
    const target = enabled && performance.now() >= resumeAt.current ? SPEED : 0;
    controls.autoRotateSpeed = THREE.MathUtils.damp(controls.autoRotateSpeed, target, 2.2, Math.min(delta, 1 / 30));
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.8}
      zoomSpeed={0.6}
      minDistance={4}
      maxDistance={9}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.7}
      autoRotate
      autoRotateSpeed={0}
      onStart={() => {
        resumeAt.current = Infinity;
      }}
      onEnd={() => {
        resumeAt.current = performance.now() + RESUME_DELAY;
      }}
    />
  );
}

export default function Bottle3D(props: Bottle3DProps) {
  const [motion] = useState(
    () => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 7], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      {/* Studio lumineux sans fichier externe, recalculé en continu pour le balayage de lumière */}
      <Environment resolution={256} frames={motion ? Infinity : 1}>
        <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        {/* Bandes verticales qui dessinent les reflets du verre */}
        <Lightformer intensity={6} position={[-2.5, 0.5, 3]} scale={[0.35, 7, 1]} />
        <Lightformer intensity={4} position={[2.2, 0.5, 3]} scale={[0.2, 7, 1]} />
        <Lightformer intensity={1.5} position={[-5, 0, -1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer intensity={1.5} position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer intensity={2} color={props.liquidColor} position={[0, -3, -4]} scale={[12, 4, 1]} />
        <Glint enabled={motion} />
      </Environment>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />

      <Intro enabled={motion}>
        <Float speed={motion ? 1.4 : 0} rotationIntensity={0.18} floatIntensity={0.5} floatingRange={[-0.06, 0.06]}>
          {props.imageUrl ? (
            <Suspense fallback={null}>
              <PhotoFlacon src={props.imageUrl} shape={props.shape} />
            </Suspense>
          ) : (
            <Flacon {...props} />
          )}
        </Float>
      </Intro>

      <ContactShadows position={[0, -1.55, 0]} opacity={0.35} scale={6} blur={2.6} far={3} />
      <Controls enabled={motion} />
    </Canvas>
  );
}
