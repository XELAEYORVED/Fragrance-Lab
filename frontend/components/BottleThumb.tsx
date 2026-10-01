import StaticBottle from "./StaticBottle";
import type { BottleShape } from "@/lib/api";

// Vignette de flacon (cartes, tableaux, comparaisons) : la photo, sans 3D.
// La 3D est réservée au grand flacon de la page détail d'un parfum.

type BottleThumbProps = {
  fragrance: {
    name: string;
    imageUrl: string | null;
    bottleShape: BottleShape;
    liquidColor: string;
    capColor: string;
  };
  className?: string;
};

export default function BottleThumb({ fragrance, className }: BottleThumbProps) {
  return (
    <div className={`relative aspect-[3/4] ${className ?? ""}`}>
      <StaticBottle fragrance={fragrance} className="size-full" />
    </div>
  );
}
