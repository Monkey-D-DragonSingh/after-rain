"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sound } from "@/lib/audio";
import { useGameStore } from "@/lib/store";

export default function TrainSystem() {
  const trainRef = useRef<THREE.Group>(null);
  const playerPos = useGameStore((s) => s.playerPos);
  const lastSoundTime = useRef(0);

  // Train moves along a scenic path through Central, Metro, and Industrial sectors
  useFrame(({ clock }) => {
    if (!trainRef.current) return;

    const t = clock.getElapsedTime() * 0.12;
    // Circular / elliptical maglev track
    const radiusX = 55;
    const radiusZ = 45;
    const x = Math.sin(t) * radiusX;
    const z = Math.cos(t) * radiusZ;
    const y = 14;

    trainRef.current.position.set(x, y, z);

    // Compute tangent heading for train orientation
    const nextX = Math.sin(t + 0.01) * radiusX;
    const nextZ = Math.cos(t + 0.01) * radiusZ;
    const angle = Math.atan2(nextX - x, nextZ - z);
    trainRef.current.rotation.y = angle;

    // Check proximity to player to trigger audio swoosh
    const dist = Math.hypot(x - playerPos[0], z - playerPos[2]);
    const now = clock.getElapsedTime();
    if (dist < 32 && now - lastSoundTime.current > 12) {
      sound.playTrainSwoosh();
      lastSoundTime.current = now;
    }
  });

  return (
    <group>
      {/* Elevated Maglev Rail Track Loop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 13.8, 0]}>
        <torusGeometry args={[50, 0.45, 12, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Track Support Pillars */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const px = Math.sin(angle) * 50;
        const pz = Math.cos(angle) * 50;
        return (
          <group key={i} position={[px, 7, pz]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.8, 14, 8]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Small blue signal light on pillar */}
            <mesh position={[0, 6.5, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        );
      })}

      {/* Automated Train Body */}
      <group ref={trainRef}>
        {/* Engine Lead Car */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.2, 1.8, 10]} />
          <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Illuminated Passenger Strip Windows (Cyan Neon) */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2.25, 0.5, 8.5]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Train Headlights */}
        <mesh position={[0, 0.4, 5.05]}>
          <boxGeometry args={[1.8, 0.35, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <pointLight position={[0, 0.4, 5.5]} color="#67e8f9" intensity={2.5} distance={20} />

        {/* Train Red Tail Lights */}
        <mesh position={[0, 0.5, -5.05]}>
          <boxGeometry args={[1.8, 0.25, 0.2]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
}
