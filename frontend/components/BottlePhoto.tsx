"use client";

import { useRef, useState } from "react";

// Photo détourée du flacon mise en scène en 3D : inclinaison qui suit le pointeur,
// reflet de lumière limité à la silhouette du flacon, flottement et reflet au sol.

type BottlePhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function BottlePhoto({ src, alt, className }: BottlePhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false });

  function onPointerMove(event: React.PointerEvent) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    // Position du pointeur ramenée entre -0.5 et 0.5
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    setTilt({ x, y, active: true });
  }

  const mask = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0, active: false })}
      className={`relative flex items-center justify-center [perspective:1200px] ${className ?? ""}`}
    >
      <div className="animate-float relative h-[72%] w-[72%]">
        <div
          className="relative size-full transition-transform duration-300 ease-out [transform-style:preserve-3d]"
          style={{
            transform: `rotateY(${tilt.x * 28}deg) rotateX(${-tilt.y * 18}deg) scale(${tilt.active ? 1.04 : 1})`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- le même fichier sert aussi de masque CSS */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="size-full object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.28)] select-none"
          />
          {/* Reflet de lumière qui glisse sur le verre */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
            style={{
              ...mask,
              opacity: tilt.active ? 1 : 0.55,
              background: `linear-gradient(${105 + tilt.x * 60}deg, transparent 30%, rgba(255,255,255,0.75) ${48 + tilt.x * 30}%, transparent 66%)`,
            }}
          />
        </div>
      </div>

      {/* Reflet au sol, façon photo produit */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-2%] h-[24%] w-[72%] scale-y-[-1] object-contain object-top opacity-25 blur-[1px] select-none"
        style={{ maskImage: "linear-gradient(to top, black, transparent 70%)", WebkitMaskImage: "linear-gradient(to top, black, transparent 70%)" }}
      />
    </div>
  );
}
