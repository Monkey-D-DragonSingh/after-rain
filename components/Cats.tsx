"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";

// Hand-placed cat spawn points. These are rough starting guesses — move them
// once you can see actual sidewalks/alleys in-world (check against your
// Districts.tsx layout).
const CAT_POSITIONS: { id: string; position: [number, number, number] }[] = [
  { id: "cat_01", position: [12, 0.15, 18] },
  { id: "cat_02", position: [-25, 0.15, 8] },
  { id: "cat_03", position: [30, 0.15, -14] },
  { id: "cat_04", position: [-10, 0.15, -30] },
  { id: "cat_05", position: [5, 0.15, 45] },
  { id: "cat_06", position: [-40, 0.15, -5] },
  { id: "cat_07", position: [18, 0.15, -42] },
  { id: "cat_08", position: [-15, 0.15, 22] },
];

const PET_RADIUS = 2.2;

function Cat({ id, position }: { id: string; position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const bounceStart = useRef<number | null>(null);
  const isFirstRun = useRef(true);

  const catPetCount = useGameStore((s) => s.catPetCount[id] ?? 0);
  const nearbyCat = useGameStore((s) => s.nearbyCat);
  const isNear = nearbyCat === id;

  // Trigger a bounce reaction whenever this cat gets petted again.
  // Kept inside useEffect (not render) so it stays purity-safe —
  // performance.now() is an impure call and must not run during render.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    bounceStart.current = performance.now();
  }, [catPetCount]);

  // Deterministic per-cat idle phase offset (hash of id, not random —
  // same cat always bobs the same way on every load).
  const idlePhase = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return (Math.abs(hash) % 1000) / 1000;
  }, [id]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 2 + idlePhase * 10) * 0.35;
    }

    if (groupRef.current) {
      // Gentle idle bob
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5 + idlePhase * 10) * 0.02;

      // Bounce reaction on pet — decays over ~0.4s
      if (bounceStart.current !== null) {
        const elapsed = (performance.now() - bounceStart.current) / 1000;
        if (elapsed < 0.4) {
          const bounce = Math.sin((elapsed / 0.4) * Math.PI) * 0.25;
          groupRef.current.scale.setScalar(1 + bounce);
        } else {
          groupRef.current.scale.setScalar(1);
          bounceStart.current = null;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Interaction ring — visible only when player is close enough to pet.
          Amber once petted at least once, cyan before that — matches the
          same discovered/undiscovered color language as Interactables.tsx */}
      <mesh position={[0, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 20]} />
        <meshBasicMaterial
          color={catPetCount > 0 ? "#f59e0b" : "#38bdf8"}
          transparent
          opacity={isNear ? 0.8 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Body */}
      <mesh scale={[0.22, 0.16, 0.32]} position={[0, 0.14, 0]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.22, 0.24]} scale={[0.14, 0.13, 0.14]} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.8} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.06, 0.32, 0.26]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.035, 0.08, 6]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      <mesh position={[0.06, 0.32, 0.26]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.035, 0.08, 6]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>

      {/* Eyes — small glow, reads nicely in a dark neon city */}
      <mesh position={[-0.045, 0.23, 0.36]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
      <mesh position={[0.045, 0.23, 0.36]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.18, -0.28]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.01, 0.35, 6]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
    </group>
  );
}

export default function Cats() {
  const playerPos = useGameStore((s) => s.playerPos);
  const nearbyCat = useGameStore((s) => s.nearbyCat);
  const setNearbyCat = useGameStore((s) => s.setNearbyCat);

  useFrame(() => {
    let closest: string | null = null;
    let minDist = PET_RADIUS;

    for (const cat of CAT_POSITIONS) {
      const dist = Math.hypot(
        cat.position[0] - playerPos[0],
        cat.position[1] - playerPos[1],
        cat.position[2] - playerPos[2]
      );
      if (dist < minDist) {
        minDist = dist;
        closest = cat.id;
      }
    }

    if (closest !== nearbyCat) {
      setNearbyCat(closest);
    }
  });

  return (
    <>
      {CAT_POSITIONS.map((cat) => (
        <Cat key={cat.id} id={cat.id} position={cat.position} />
      ))}
    </>
  );
}
