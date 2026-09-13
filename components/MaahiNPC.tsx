"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";

// Rough starting spot — move this once you can see actual streets/plazas
// in-world (check against your Districts.tsx layout).
const MAAHI_POSITION: [number, number, number] = [4, 0, 9];
const TALK_RADIUS = 2.6;

export default function MaahiNPC() {
  const groupRef = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Mesh>(null);

  const playerPos = useGameStore((s) => s.playerPos);
  const nearbyNPC = useGameStore((s) => s.nearbyNPC);
  const setNearbyNPC = useGameStore((s) => s.setNearbyNPC);
  const npcDialogueOpen = useGameStore((s) => s.npcDialogueOpen);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Proximity check — same pattern as Cats.tsx / Interactables.tsx
    const dist = Math.hypot(
      MAAHI_POSITION[0] - playerPos[0],
      MAAHI_POSITION[1] - playerPos[1],
      MAAHI_POSITION[2] - playerPos[2]
    );
    const isNear = dist < TALK_RADIUS;
    if (isNear !== nearbyNPC) {
      setNearbyNPC(isNear);
    }

    // Idle breathing sway
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(t * 1.2) * 0.008;
    }

    // Hair sway
    if (hairRef.current) {
      hairRef.current.rotation.z = Math.sin(t * 0.9) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={MAAHI_POSITION}>
      {/* Interaction ring — glows when in talk range, brighter while mid-conversation */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.65, 24]} />
        <meshBasicMaterial
          color="#d946ef"
          transparent
          opacity={nearbyNPC ? (npcDialogueOpen ? 0.9 : 0.6) : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft ambient glow around her — mysterious/beautiful presence */}
      <pointLight
        position={[0, 1.3, 0]}
        color="#e879f9"
        intensity={nearbyNPC ? 1.6 : 0.7}
        distance={6}
      />

      {/* Body — coat/dress silhouette */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 1.3, 16]} />
        <meshStandardMaterial color="#3b0764" roughness={0.55} metalness={0.1} />
      </mesh>

      {/* Shoulders/upper body accent */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 12]} />
        <meshStandardMaterial color="#4c0a75" roughness={0.5} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#e8beac" roughness={0.6} />
      </mesh>

      {/* Hair — swept back, slightly elongated for a flowing look */}
      <mesh ref={hairRef} position={[0, 1.7, -0.05]} scale={[1, 1.15, 1.1]} castShadow>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#150a24" roughness={0.4} />
      </mesh>

      {/* Eyes — soft violet glow, reads as striking rather than eerie */}
      <mesh position={[-0.05, 1.685, 0.135]}>
        <sphereGeometry args={[0.014, 6, 6]} />
        <meshBasicMaterial color="#e879f9" />
      </mesh>
      <mesh position={[0.05, 1.685, 0.135]}>
        <sphereGeometry args={[0.014, 6, 6]} />
        <meshBasicMaterial color="#e879f9" />
      </mesh>
    </group>
  );
}
