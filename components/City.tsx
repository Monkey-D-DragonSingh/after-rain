"use client";

import { useMemo } from "react";

type Building = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissiveIntensity: number;
};

// Deterministic pseudo-random generator for consistent grid layout
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateCity(gridSize: number, spacing: number): Building[] {
  const buildings: Building[] = [];
  const neonColors = ["#1a1a2e", "#16213e", "#0f3460", "#1b1b2f"];
  let seed = 42;

  for (let x = -gridSize; x <= gridSize; x++) {
    for (let z = -gridSize; z <= gridSize; z++) {
      if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
      if (seededRandom(seed++) < 0.25) continue;

      const height = 4 + seededRandom(seed++) * 20;
      const colorIdx = Math.floor(seededRandom(seed++) * neonColors.length);

      buildings.push({
        position: [x * spacing, height / 2, z * spacing],
        size: [
          spacing * 0.6 + seededRandom(seed++) * 1.5,
          height,
          spacing * 0.6 + seededRandom(seed++) * 1.5,
        ],
        color: neonColors[colorIdx],
        emissiveIntensity: seededRandom(seed++) > 0.6 ? 0.15 : 0.02,
      });
    }
  }
  return buildings;
}

export default function City() {
  const buildings = useMemo(() => generateCity(10, 5), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.15} metalness={0.6} />
      </mesh>

      {buildings.map((b, i) => (
        <mesh key={i} position={b.position} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial
            color={b.color}
            emissive="#3fd9ff"
            emissiveIntensity={b.emissiveIntensity}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}