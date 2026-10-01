"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { Bottle3DProps } from "./Bottle3D";
import { createPointer, trackPointer } from "./Tilt3D";

// WebGL n'existe que dans le navigateur : la scène 3D est chargée côté client uniquement
const Bottle3D = dynamic(() => import("./Bottle3D"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-accent-soft blur-2xl" />,
});

// Grand flacon 3D qui s'incline vers la souris
export default function BottleViewer({ className, ...props }: Omit<Bottle3DProps, "pointer"> & { className?: string }) {
  const pointer = useRef(createPointer());

  return (
    <div
      className={className}
      onPointerMove={(event) => trackPointer(pointer.current, event, event.currentTarget)}
      onPointerLeave={() => {
        pointer.current.active = false;
      }}
    >
      <Bottle3D {...props} pointer={pointer} />
    </div>
  );
}
