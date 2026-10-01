"use client";

import dynamic from "next/dynamic";

// La scène WebGL n'existe que dans le navigateur
const SharedScene = dynamic(() => import("./SharedScene"), { ssr: false });

export default function SharedSceneLoader() {
  return <SharedScene />;
}
