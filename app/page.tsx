"use client";

import dynamic from "next/dynamic";
import { useGameStore } from "@/lib/store";
import IntroScreen from "@/components/UI/IntroScreen";
import HUD from "@/components/UI/HUD";
import MemoryModal from "@/components/UI/MemoryModal";
import MapModal from "@/components/UI/MapModal";
import EndingSequence from "@/components/UI/EndingSequence";
import MobileControls from "@/components/UI/MobileControls";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Home() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <main className="relative w-screen h-screen bg-[#020204] overflow-hidden select-none">
      {/* 3D WebGL Canvas Layer */}
      <Scene />

      {/* Cinematic Screen Overlays (Vignette & Scanlines) */}
      <div className="absolute inset-0 cinematic-vignette pointer-events-none z-10" />
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none z-10" />

      {/* State-dependent UI Components */}
      {gameState === "intro" && <IntroScreen />}
      {gameState === "playing" && <HUD />}
      {(gameState === "memories" || gameState === "inspecting") && <MemoryModal />}
      {gameState === "map" && <MapModal />}
      {gameState === "ending" && <EndingSequence />}

      {/* Mobile Touch Controls */}
      <MobileControls />
    </main>
  );
}