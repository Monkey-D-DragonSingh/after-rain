"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";


const MAAHI_POSITION: [number, number, number] = [4, 0, 9];
const TALK_RADIUS = 2.6;

export default function MaahiNPC() {
  const groupRef = useRef<THREE.Group>(null);
  const hairRef = useRef<THREE.Mesh>(null);

 const playerPos = useGameStore((s) => s.playerPos);
const nearbyNPC = useGameStore((s) => s.nearbyNPC);
const setNearbyNPC = useGameStore((s) => s.setNearbyNPC);
const npcDialogueOpen = useGameStore((s) => s.npcDialogueOpen);
const talkToMaahi = useGameStore((s) => s.talkToMaahi);
  // Proximity + idle animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const dist = Math.hypot(
      MAAHI_POSITION[0] - playerPos[0],
      MAAHI_POSITION[1] - playerPos[1],
      MAAHI_POSITION[2] - playerPos[2]
    );
    const isNear = dist < TALK_RADIUS;
    if (isNear !== nearbyNPC) setNearbyNPC(isNear);

    if (groupRef.current) {
      groupRef.current.position.y = MAAHI_POSITION[1] + Math.sin(t * 1.3) * 0.015;
    }
    if (hairRef.current) {
      hairRef.current.rotation.z = Math.sin(t * 0.9) * 0.04;
    }
  });

  // THE MISSING PIECE — listens for "E" to open/close dialogue
  useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key.toLowerCase() === "e" && nearbyNPC) {
      talkToMaahi(); // pehli baar dialogue start karega, dobara dabane pe next line
    }
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [nearbyNPC, talkToMaahi]);

  const skin = "#e8beac";
  const hairColor = "#150a24";
  const dress = "#3b0764";

  return (
    <group ref={groupRef} position={MAAHI_POSITION}>
      {/* Interaction ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.65, 32]} />
        <meshBasicMaterial
          color="#d946ef"
          transparent
          opacity={nearbyNPC ? (npcDialogueOpen ? 0.9 : 0.6) : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rim/ambient glow */}
      <pointLight position={[0, 1.3, 0.3]} color="#e879f9" intensity={nearbyNPC ? 1.8 : 0.9} distance={6} />
      <pointLight position={[0, 1.3, -0.4]} color="#7dd3fc" intensity={0.5} distance={4} />

      {/* Legs — capsules read far more natural than cylinders */}
      <mesh position={[-0.09, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.065, 0.55, 4, 8]} />
        <meshStandardMaterial color={dress} roughness={0.5} />
      </mesh>
      <mesh position={[0.09, 0.35, 0]} castShadow>
        <capsuleGeometry args={[0.065, 0.55, 4, 8]} />
        <meshStandardMaterial color={dress} roughness={0.5} />
      </mesh>

      {/* Torso — tapered capsule instead of a straight cylinder */}
      <mesh position={[0, 1.05, 0]} scale={[1, 1, 0.85]} castShadow>
        <capsuleGeometry args={[0.19, 0.55, 6, 12]} />
        <meshStandardMaterial color={dress} roughness={0.5} metalness={0.08} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.26, 1.1, 0]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.045, 0.5, 4, 8]} />
        <meshStandardMaterial color={dress} roughness={0.5} />
      </mesh>
      <mesh position={[0.26, 1.1, 0]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.045, 0.5, 4, 8]} />
        <meshStandardMaterial color={dress} roughness={0.5} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.06, 0.1, 12]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>

      {/* Head — higher segment count = much smoother than the old default */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>

      {/* Hair — cap + ponytail, gives silhouette instead of a blob */}
      <mesh
        ref={hairRef}
        position={[0, 1.66, -0.02]}
        scale={[1.05, 1.1, 1.1]}
        castShadow
      >
        <sphereGeometry args={[0.155, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial color={hairColor} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.35, -0.14]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.4, 4, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.35} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.055, 1.625, 0.135]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial color="#e879f9" />
      </mesh>
      <mesh position={[0.055, 1.625, 0.135]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshBasicMaterial color="#e879f9" />
      </mesh>
    </group>
  );
}