"use client";

import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { BottleShape } from "@/lib/api";

// Flacon 3D reconstruit à partir de sa photo détourée :
// la largeur du flacon est mesurée ligne par ligne sur l'image, puis chaque ligne
// devient une section (ronde ou rectangulaire arrondie) d'un volume texturé par la photo.
// Sur les flancs, que la photo ne montre pas, la texture laisse place à la couleur du bord.

const HEIGHT = 2.6; // hauteur du flacon dans la scène
const ROWS = 200; // résolution verticale de la silhouette
const SEGMENTS = 48; // points par demi-section
const SMOOTHING = 3; // lignes de part et d'autre pour lisser la silhouette
const EDGE_BAND = 0.12; // part de la largeur utilisée pour la couleur des flancs
const SIDE_SMOOTHING = 12; // lignes de part et d'autre pour adoucir la couleur des flancs
const SIDE_UNIFORMITY = 0.45; // attraction de chaque ligne vers la teinte moyenne des flancs

// Profondeur relative et arrondi de la section selon la forme du flacon
const sections: Record<BottleShape, { depth: number; roundness: number }> = {
  CYLINDER: { depth: 1, roundness: 2 },
  ROUND: { depth: 0.55, roundness: 2 },
  PEBBLE: { depth: 0.6, roundness: 2.2 },
  RECTANGLE: { depth: 0.45, roundness: 6 },
  SQUARE: { depth: 0.7, roundness: 5 },
  FACETED: { depth: 0.8, roundness: 3 },
};

type RGB = [number, number, number];
type Row = { y: number; v: number; center: number; half: number; left: RGB; right: RGB };
type Pixels = { data: Uint8ClampedArray; width: number; height: number };

function readPixels(image: CanvasImageSource, width: number, height: number): Pixels {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0, width, height);
  return { data: ctx.getImageData(0, 0, width, height).data, width, height };
}

// Limites gauche/droite des pixels opaques d'une ligne, ou null si la ligne est vide
function rowBounds({ data, width }: Pixels, y: number) {
  let left = -1;
  let right = -1;
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3]! > 128) {
      if (left < 0) left = x;
      right = x;
    }
  }
  return left < 0 ? null : { left, right };
}

// Couleur moyenne des pixels opaques entre deux colonnes
function averageColor({ data, width }: Pixels, y: number, from: number, to: number): RGB | null {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let x = Math.max(0, from); x <= Math.min(width - 1, to); x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3]! > 128) {
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      n++;
    }
  }
  return n ? [r / n, g / n, b / n] : null;
}

// Texture entièrement opaque : les zones transparentes à l'intérieur du flacon (verre clair
// effacé par le détourage) sont bouchées avec la couleur de la ligne, et l'extérieur prolonge
// le bord, pour qu'aucun trou ni liseré sombre n'apparaisse sur le volume.
function opaqueTexture(image: HTMLImageElement) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const pixels: Pixels = { data, width, height };
  let fallback: RGB = [235, 235, 238];

  for (let y = 0; y < height; y++) {
    const bounds = rowBounds(pixels, y);
    const fill = bounds ? (averageColor(pixels, y, bounds.left, bounds.right) ?? fallback) : fallback;
    fallback = fill;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // Hors silhouette : on recopie le pixel du bord le plus proche
      const edge = !bounds ? -1 : x < bounds.left ? bounds.left : x > bounds.right ? bounds.right : -1;
      if (edge >= 0) {
        const source = (y * width + edge) * 4;
        data[i] = data[source]!;
        data[i + 1] = data[source + 1]!;
        data[i + 2] = data[source + 2]!;
      } else if (data[i + 3]! < 250) {
        // Pixel transparent ou semi-transparent : complété avec la couleur de la ligne
        const a = data[i + 3]! / 255;
        data[i] = data[i]! * a + fill[0] * (1 - a);
        data[i + 1] = data[i + 1]! * a + fill[1] * (1 - a);
        data[i + 2] = data[i + 2]! * a + fill[2] * (1 - a);
      }
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function averageRGB(colors: RGB[]): RGB {
  const sum = colors.reduce<RGB>((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
  return [sum[0] / colors.length, sum[1] / colors.length, sum[2] / colors.length];
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}

// Mesure, pour chaque ligne de l'image, le centre, la demi-largeur et la couleur des bords
function measureSilhouette(image: HTMLImageElement) {
  const h = ROWS;
  const w = Math.round((image.naturalWidth / image.naturalHeight) * h);
  const pixels = readPixels(image, w, h);
  const scale = HEIGHT / h;

  const rows: Row[] = [];
  for (let y = 0; y < h; y++) {
    const bounds = rowBounds(pixels, y);
    if (!bounds) continue;
    const band = Math.max(1, Math.round((bounds.right - bounds.left) * EDGE_BAND));
    const middle = averageColor(pixels, y, bounds.left, bounds.right) ?? [200, 200, 200];
    rows.push({
      y: HEIGHT / 2 - (y + 0.5) * scale,
      v: 1 - (y + 0.5) / h,
      center: ((bounds.left + bounds.right + 1) / 2 - w / 2) * scale,
      half: ((bounds.right - bounds.left + 1) / 2) * scale,
      left: averageColor(pixels, y, bounds.left, bounds.left + band) ?? middle,
      right: averageColor(pixels, y, bounds.right - band, bounds.right) ?? middle,
    });
  }

  // Teinte moyenne des flancs, vers laquelle chaque ligne est attirée (pas de rayures sur le verre ciselé)
  const overall = averageRGB(rows.flatMap((r) => [r.left, r.right]));

  // Médiane glissante sur la silhouette (supprime les dents du détourage sans arrondir les épaules)
  // et moyenne large sur la couleur des flancs
  const smoothed = rows.map((row, i) => {
    const near = rows.slice(Math.max(0, i - SMOOTHING), i + SMOOTHING + 1);
    const wide = rows.slice(Math.max(0, i - SIDE_SMOOTHING), i + SIDE_SMOOTHING + 1);
    return {
      ...row,
      half: median(near.map((r) => r.half)),
      center: median(near.map((r) => r.center)),
      left: mixRGB(averageRGB(wide.map((r) => r.left)), overall, SIDE_UNIFORMITY),
      right: mixRGB(averageRGB(wide.map((r) => r.right)), overall, SIDE_UNIFORMITY),
    };
  });

  // Fermeture du volume en haut et en bas
  const first = smoothed[0]!;
  const last = smoothed[smoothed.length - 1]!;
  return { rows: [{ ...first, half: 0 }, ...smoothed, { ...last, half: 0 }], width: w * scale };
}

// Superellipse : roundness 2 = cercle, plus grand = rectangle aux coins arrondis
function sectionPoint(theta: number, half: number, depth: number, roundness: number) {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const p = 2 / roundness;
  return {
    x: half * Math.sign(c) * Math.abs(c) ** p,
    z: half * depth * Math.sign(s) * Math.abs(s) ** p,
  };
}

const toLinear = (c: number) => (c / 255) ** 2.2;

function buildGeometry(rows: Row[], width: number, shape: BottleShape) {
  const { depth, roundness } = sections[shape];
  const positions: number[] = [];
  const uvs: number[] = [];
  const facing: number[] = [];
  const sides: number[] = [];
  const indices: number[] = [];

  // Deux moitiés indépendantes (avant puis arrière) pour que la photo ne se déchire pas sur les côtés
  for (const side of ["front", "back"] as const) {
    const offset = positions.length / 3;
    const start = side === "front" ? 0 : Math.PI;

    for (const row of rows) {
      for (let j = 0; j <= SEGMENTS; j++) {
        const theta = start + (j / SEGMENTS) * Math.PI;
        const { x, z } = sectionPoint(theta, row.half, depth, roundness);
        positions.push(row.center + x, row.y, z);
        // Projection de face ; à l'arrière l'image est retournée pour rester lisible
        const u = (row.center + x) / width + 0.5;
        uvs.push(side === "front" ? u : 1 - u, row.v);
        // 1 face à la caméra, 0 sur le flanc
        facing.push(Math.abs(Math.sin(theta)));
        const edge = Math.cos(theta) < 0 ? row.left : row.right;
        sides.push(toLinear(edge[0]), toLinear(edge[1]), toLinear(edge[2]));
      }
    }

    const stride = SEGMENTS + 1;
    for (let i = 0; i < rows.length - 1; i++) {
      for (let j = 0; j < SEGMENTS; j++) {
        const a = offset + i * stride + j;
        const b = a + stride;
        indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("aFacing", new THREE.Float32BufferAttribute(facing, 1));
  geometry.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Matériau vernis : la photo garde ses couleurs (émissive), le vernis ajoute des reflets,
// et un fondu remplace la photo étirée par la couleur du bord sur les flancs.
function createMaterial(texture: THREE.Texture) {
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 0.5,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 0.75,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aFacing;\nattribute vec3 aSide;\nvarying float vFacing;\nvarying vec3 vSide;",
      )
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFacing = aFacing;\nvSide = aSide;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vFacing;\nvarying vec3 vSide;")
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
          vec4 photo = texture2D( map, vMapUv );
          diffuseColor.rgb *= mix( vSide, photo.rgb, smoothstep( 0.08, 0.42, vFacing ) );
        #endif`,
      )
      .replace("#include <emissivemap_fragment>", "totalEmissiveRadiance *= diffuseColor.rgb;");
  };
  material.customProgramCacheKey = () => "photo-flacon";
  return material;
}

export default function PhotoFlacon({ src, shape }: { src: string; shape: BottleShape }) {
  const loaded = useTexture(src);

  const { geometry, material } = useMemo(() => {
    const image = loaded.image as HTMLImageElement;
    const { rows, width } = measureSilhouette(image);
    return {
      geometry: buildGeometry(rows, width, shape),
      material: createMaterial(opaqueTexture(image)),
    };
  }, [loaded, shape]);

  // Libère la mémoire GPU quand le flacon change ou disparaît
  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <mesh geometry={geometry} material={material} position={[0, -0.2, 0]} />;
}
