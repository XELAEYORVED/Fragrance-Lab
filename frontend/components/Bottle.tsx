import type { BottleShape } from "@/lib/api";

// Flacon vectoriel provisoire, remplacé par le rendu 3D dans feature/3d-bottle

type BottleProps = {
  shape: BottleShape;
  liquidColor: string;
  capColor: string;
  className?: string;
  animated?: boolean;
};

// Silhouette du verre pour chaque forme, dans une zone de 100 × 160
const bodies: Record<BottleShape, { path: string; neckY: number }> = {
  ROUND: { path: "M50 52 C82 52 92 78 92 104 C92 134 74 152 50 152 C26 152 8 134 8 104 C8 78 18 52 50 52 Z", neckY: 52 },
  SQUARE: { path: "M14 58 H86 Q92 58 92 64 V146 Q92 152 86 152 H14 Q8 152 8 146 V64 Q8 58 14 58 Z", neckY: 58 },
  RECTANGLE: { path: "M22 50 H78 Q84 50 84 56 V146 Q84 152 78 152 H22 Q16 152 16 146 V56 Q16 50 22 50 Z", neckY: 50 },
  CYLINDER: { path: "M26 46 H74 Q78 46 78 50 V148 Q78 152 74 152 H26 Q22 152 22 148 V50 Q22 46 26 46 Z", neckY: 46 },
  PEBBLE: { path: "M50 56 C80 56 94 82 92 110 C90 138 72 152 50 152 C28 152 10 138 8 110 C6 82 20 56 50 56 Z", neckY: 56 },
  FACETED: { path: "M24 54 L76 54 L90 72 L90 136 L76 152 L24 152 L10 136 L10 72 Z", neckY: 54 },
};

export default function Bottle({ shape, liquidColor, capColor, className, animated }: BottleProps) {
  const { path, neckY } = bodies[shape];
  const id = `b-${shape}-${liquidColor.slice(1)}-${capColor.slice(1)}`;

  return (
    <svg
      viewBox="0 0 100 168"
      className={`${animated ? "animate-float" : ""} ${className ?? ""}`}
      role="img"
      aria-label="Flacon de parfum"
    >
      <defs>
        <linearGradient id={`${id}-liquid`} x1="0" x2="1">
          <stop offset="0" stopColor={liquidColor} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={liquidColor} stopOpacity="0.7" />
          <stop offset="1" stopColor={liquidColor} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={path} />
        </clipPath>
      </defs>

      {/* Ombre portée */}
      <ellipse cx="50" cy="160" rx="34" ry="4" fill="#000" opacity="0.18" />

      {/* Bouchon et col */}
      <rect x="40" y={neckY - 10} width="20" height="10" fill="#d9d2c5" opacity="0.5" />
      <rect x="32" y={neckY - 40} width="36" height="30" rx="3" fill={capColor} />
      <rect x="35" y={neckY - 38} width="4" height="26" rx="2" fill="#fff" opacity="0.18" />

      {/* Verre et jus */}
      <path d={path} fill="#ffffff" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.2" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y={neckY + 14} width="100" height="160" fill={`url(#${id}-liquid)`} />
        <rect x="0" y="0" width="100" height="168" fill={`url(#${id}-shine)`} />
      </g>
    </svg>
  );
}
