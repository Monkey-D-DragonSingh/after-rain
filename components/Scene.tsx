"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Atmosphere from "./Atmosphere";
import Clouds from "./Clouds";
import Rain from "./Rain";
import Districts from "./Districts";
import TrainSystem from "./TrainSystem";
import TrafficLights from "./TrafficLights";
import Drones from "./Drones";
import Interactables from "./Interactables";
import PlayerController from "./PlayerController";
import { useGameStore } from "@/lib/store";
import WorldManager from "./WorldManager";

function IntroCamera() {
  const gameState = useGameStore((s) => s.gameState);
  const cameraRef = useRef<THREE.Group>(null);

  useFrame(({ clock, camera }) => {
    if (gameState === "intro") {
      const t = clock.getElapsedTime() * 0.08;
      // Gentle cinematic fly-through between skyscrapers
      const camX = Math.sin(t) * 45;
      const camZ = Math.cos(t) * 45;
      const camY = 22 + Math.sin(t * 0.5) * 4;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 10, 0);
    }
  });

  return <group ref={cameraRef} />;
}

export default function Scene() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 24, 45], fov: 60 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
          powerPreference: "high-performance",
        }}
      >
        {/* Atmosphere owns the scene's fog (fogExp2, dynamically animated
            for weather/thunder/dawn). Do not add another <fog> here —
            a scene can only have one, and they'll fight each other. */}
        <Atmosphere />
        <Clouds />
        <Rain />
        <Districts />
        <TrainSystem />
        <TrafficLights />
        <Drones />
        <Interactables />
        <WorldManager />

        {gameState === "intro" ? <IntroCamera /> : <PlayerController />}
      </Canvas>
    </div>
  );
}
