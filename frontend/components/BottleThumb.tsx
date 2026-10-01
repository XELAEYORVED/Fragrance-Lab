import Image from "next/image";
import Bottle from "@/components/Bottle";
import type { BottleShape } from "@/lib/api";

// Petite vignette : la photo du flacon si elle existe, sinon le flacon dessiné

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
  if (fragrance.imageUrl) {
    return (
      <div className={`relative aspect-[3/4] ${className ?? ""}`}>
        <Image
          src={fragrance.imageUrl}
          alt={fragrance.name}
          fill
          sizes="200px"
          className="object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.25)]"
        />
      </div>
    );
  }
  return (
    <Bottle
      className={className}
      shape={fragrance.bottleShape}
      liquidColor={fragrance.liquidColor}
      capColor={fragrance.capColor}
    />
  );
}
