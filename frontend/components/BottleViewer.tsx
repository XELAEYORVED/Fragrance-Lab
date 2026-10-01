"use client";

import dynamic from "next/dynamic";
import type { Bottle3DProps } from "./Bottle3D";

// WebGL n'existe que dans le navigateur : la scène 3D est chargée côté client uniquement
const Bottle3D = dynamic(() => import("./Bottle3D"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-accent-soft blur-2xl" />,
});

export default function BottleViewer({ className, ...props }: Bottle3DProps & { className?: string }) {
  return (
    <div className={`cursor-grab active:cursor-grabbing ${className ?? ""}`}>
      <Bottle3D {...props} />
    </div>
  );
}
