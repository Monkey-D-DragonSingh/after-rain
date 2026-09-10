"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";
import { MemoryItem } from "@/lib/types";

export default function Interactables() {
  const memories = useGameStore((s) => s.memories);
  const playerPos = useGameStore((s) => s.playerPos);
  const setNearbyMemory = useGameStore((s) => s.setNearbyMemory);
  const nearbyMemory = useGameStore((s) => s.nearbyMemory);

  const ringRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    // Spin interaction indicators
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.75;
    }

    // Check proximity to all memory objects
    let closest: MemoryItem | null = null;
    let minDist = 4.2;

    for (const mem of memories) {
      const dist = Math.hypot(
        mem.position[0] - playerPos[0],
        mem.position[1] - playerPos[1],
        mem.position[2] - playerPos[2]
      );
      if (dist < minDist) {
        minDist = dist;
        closest = mem;
      }
    }

    if (closest?.id !== nearbyMemory?.id) {
      setNearbyMemory(closest);
    }
  });

  return (
    <group ref={ringRef}>
      {memories.map((mem) => {
        const isNear = nearbyMemory?.id === mem.id;
        const [x, y, z] = mem.position;

        return (
          <group key={mem.id} position={[x, y, z]}>
            {/* Ground pulsing discovery ring */}
            <mesh position={[0, -y + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.7, 0.85, 24]} />
              <meshBasicMaterial
                color={mem.discovered ? "#10b981" : isNear ? "#f59e0b" : "#38bdf8"}
                transparent
                opacity={isNear ? 0.9 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing vertical marker beam */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
              <meshBasicMaterial
                color={mem.discovered ? "#10b981" : "#38bdf8"}
                transparent
                opacity={isNear ? 0.8 : 0.3}
              />
            </mesh>

            {/* Object Specific Visual Render */}
            {mem.objectType === 'coffee' && (
              <group>
                {/* Round metal cafe table */}
                <mesh position={[0, -0.6, 0]}>
                  <cylinderGeometry args={[0.7, 0.7, 0.05, 16]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, -1.1, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 1.0, 8]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Coffee Mug */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.12, 0.1, 0.22, 12]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.4} />
                </mesh>
              </group>
            )}

            {mem.objectType === 'watch' && (
              <group>
                {/* Brass pocket watch body */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                  <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Glowing dial */}
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.17, 16]} />
                  <meshBasicMaterial color="#fef3c7" />
                </mesh>
              </group>
            )}

            {mem.objectType === 'drawing' && (
              <group>
                {/* Refrigerator metal panel */}
                <mesh position={[0, 0, -0.05]}>
                  <boxGeometry args={[1.2, 1.6, 0.08]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Construction Paper with Glowing Blue Eye */}
                <mesh position={[0, 0, 0.01]}>
                  <planeGeometry args={[0.7, 0.9]} />
                  <meshBasicMaterial color="#e2e8f0" />
                </mesh>
                <mesh position={[0, 0.2, 0.02]}>
                  <circleGeometry args={[0.18, 16]} />
                  <meshBasicMaterial color="#0284c7" />
                </mesh>
              </group>
            )}

            {mem.objectType === 'tv' && (
              <group>
                {/* Retro CRT casing */}
                <mesh>
                  <boxGeometry args={[0.8, 0.6, 0.6]} />
                  <meshStandardMaterial color="#1e293b" roughness={0.5} />
                </mesh>
                {/* Flickering Amber Screen */}
                <mesh position={[0, 0, 0.31]}>
                  <planeGeometry args={[0.65, 0.45]} />
                  <meshBasicMaterial color="#fbbf24" />
                </mesh>
                <pointLight position={[0, 0, 0.6]} color="#fbbf24" intensity={1.8} distance={5} />
              </group>
            )}

            {mem.objectType === 'phone' && (
              <group>
                {/* Hanging Phone Terminal */}
                <mesh rotation={[0.2, 0, 0.1]}>
                  <boxGeometry args={[0.15, 0.35, 0.04]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.9} />
                </mesh>
                <mesh position={[0, 0, 0.025]}>
                  <planeGeometry args={[0.13, 0.3]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
              </group>
            )}

            {mem.objectType === 'cake' && (
              <group>
                {/* Birthday Cake */}
                <mesh>
                  <cylinderGeometry args={[0.3, 0.3, 0.22, 16]} />
                  <meshStandardMaterial color="#fce7f3" roughness={0.6} />
                </mesh>
                {/* 9 Candles */}
                {Array.from({ length: 9 }).map((_, ci) => {
                  const ca = (ci / 9) * Math.PI * 2;
                  return (
                    <mesh key={ci} position={[Math.cos(ca) * 0.2, 0.18, Math.sin(ca) * 0.2]}>
                      <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
                      <meshBasicMaterial color="#f43f5e" />
                    </mesh>
                  );
                })}
              </group>
            )}

            {mem.objectType === 'ticket' && (
              <group rotation={[-0.3, 0.2, 0]}>
                {/* Magnetic Transit Ticket */}
                <mesh>
                  <boxGeometry args={[0.35, 0.02, 0.2]} />
                  <meshBasicMaterial color="#a855f7" />
                </mesh>
              </group>
            )}

            {mem.objectType === 'umbrella' && (
              <group>
                {/* Clear Vinyl Umbrella Dome */}
                <mesh position={[0, 0.2, 0]} rotation={[0.3, 0, 0]}>
                  <sphereGeometry args={[0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
                  <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
                {/* Dry leather shoes beneath bench */}
                <mesh position={[-0.15, -0.9, 0]}>
                  <boxGeometry args={[0.14, 0.1, 0.32]} />
                  <meshStandardMaterial color="#451a03" roughness={0.4} />
                </mesh>
                <mesh position={[0.15, -0.9, 0]}>
                  <boxGeometry args={[0.14, 0.1, 0.32]} />
                  <meshStandardMaterial color="#451a03" roughness={0.4} />
                </mesh>
              </group>
            )}

            {mem.objectType === 'terminal' && (
              <group>
                {/* Master Directorate Console Spire */}
                <mesh position={[0, -0.5, 0]}>
                  <cylinderGeometry args={[0.9, 1.2, 1.2, 24]} />
                  <meshStandardMaterial color="#042f2e" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Holographic Glowing Sphere */}
                <mesh position={[0, 0.6, 0]}>
                  <sphereGeometry args={[0.45, 24, 24]} />
                  <meshBasicMaterial color="#34d399" wireframe />
                </mesh>
                <pointLight position={[0, 0.8, 0]} color="#34d399" intensity={2.5} distance={10} />
              </group>
            )}

            {/* Interaction point light */}
            <pointLight
              position={[0, 0.6, 0]}
              color={mem.discovered ? "#10b981" : isNear ? "#f59e0b" : "#38bdf8"}
              intensity={isNear ? 1.8 : 0.8}
              distance={6}
            />
          </group>
        );
      })}
    </group>
  );
}
