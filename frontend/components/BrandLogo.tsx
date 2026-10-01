// Logo d'une maison sur une plaque claire (les logos gardent leurs vraies couleurs en mode sombre).
// Sans logo disponible, le nom de la maison est composé comme un logotype.

type BrandLogoProps = {
  brand: { name: string; logoUrl?: string | null };
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { plate: "h-10 w-24 rounded-xl px-2", text: "text-[9px] tracking-[0.18em]" },
  md: { plate: "h-24 w-full rounded-2xl px-6", text: "text-sm tracking-[0.28em]" },
  lg: { plate: "h-28 w-56 rounded-3xl px-7", text: "text-base tracking-[0.3em]" },
};

export default function BrandLogo({ brand, size = "md", className }: BrandLogoProps) {
  const { plate, text } = sizes[size];

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_-10px_rgba(0,0,0,0.35)] ${plate} ${className ?? ""}`}
    >
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logos SVG servis tels quels
        <img
          src={brand.logoUrl}
          alt={`Logo ${brand.name}`}
          loading="lazy"
          draggable={false}
          className="h-[72%] w-auto max-w-full object-contain select-none"
        />
      ) : (
        <span className={`text-center font-serif leading-tight text-neutral-900 uppercase ${text}`}>
          {brand.name}
        </span>
      )}
    </span>
  );
}
