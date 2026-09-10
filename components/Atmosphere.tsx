"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";

export default function Atmosphere() {
  const chapter = useGameStore((s) => s.chapter);
  const weather = useGameStore((s) => s.weather);
  const thunderFlash = useGameStore((s) => s.thunderFlash);
  const triggerThunder = useGameStore((s) => s.triggerThunder);
  const triggerAnnouncement = useGameStore((s) => s.triggerAnnouncement);
  const gameState = useGameStore((s) => s.gameState);

  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const searchlight1Ref = useRef<THREE.Group>(null);
  const searchlight2Ref = useRef<THREE.Group>(null);
  const searchlight3Ref = useRef<THREE.Group>(null);

  // Periodic random thunder and city announcements during active exploration
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Random thunder every 24-40 seconds
    const thunderTimer = setInterval(() => {
      if (weather !== 'dawn' && weather !== 'clearing' && Math.random() > 0.3) {
        triggerThunder();
      }
    }, 28000);

    // Periodic city announcement every 35-60 seconds
    const annTimer = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerAnnouncement();
      }
    }, 42000);

    return () => {
      clearInterval(thunderTimer);
      clearInterval(annTimer);
    };
  }, [gameState, weather, triggerThunder, triggerAnnouncement]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Sweeping sky searchlights (Classic Blade Runner LAPD / Wallace Corp surveillance beams)
    if (searchlight1Ref.current) {
      searchlight1Ref.current.rotation.y = Math.sin(t * 0.25) * 0.8;
      searchlight1Ref.current.rotation.z = 0.2 + Math.cos(t * 0.3) * 0.3;
    }
    if (searchlight2Ref.current) {
      searchlight2Ref.current.rotation.y = Math.PI * 0.7 + Math.cos(t * 0.22) * 0.9;
      searchlight2Ref.current.rotation.z = -0.3 + Math.sin(t * 0.28) * 0.25;
    }
    if (searchlight3Ref.current) {
      searchlight3Ref.current.rotation.y = -Math.PI * 0.5 + Math.sin(t * 0.18) * 0.7;
      searchlight3Ref.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    }

    if (!ambientLightRef.current || !dirLightRef.current || !hemiLightRef.current || !fogRef.current) return;

    // When thunder strikes, flash brilliantly across the wet metropolis
    if (thunderFlash) {
      ambientLightRef.current.intensity = 2.4;
      ambientLightRef.current.color.set('#e0e7ff');
      hemiLightRef.current.intensity = 2.8;
      dirLightRef.current.intensity = 3.5;
      dirLightRef.current.color.set('#ffffff');
      if (fogRef.current) fogRef.current.color.set('#1e293b');
      return;
    }

    // Normal weather or Dawn (Chapter 5)
    if (chapter === 5 || weather === 'dawn') {
      // Golden pre-dawn sunlight breaking through the clouds
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.75, 0.05);
      ambientLightRef.current.color.lerp(new THREE.Color('#fed7aa'), 0.05);

      hemiLightRef.current.intensity = THREE.MathUtils.lerp(hemiLightRef.current.intensity, 0.9, 0.05);
      hemiLightRef.current.color.lerp(new THREE.Color('#fde047'), 0.05);
      hemiLightRef.current.groundColor.lerp(new THREE.Color('#ea580c'), 0.05);

      dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 1.6, 0.05);
      dirLightRef.current.color.lerp(new THREE.Color('#fbbf24'), 0.05);
      dirLightRef.current.position.set(50, 45, 40);

      fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, 0.006, 0.04);
      fogRef.current.color.lerp(new THREE.Color('#292524'), 0.05);
    } else {
      // Blade Runner 2049 Atmospheric Night City - Highly Observable & Rich Contrast
      // Bright sky ambient fill (cyan-indigo)
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.52, 0.06);
      ambientLightRef.current.color.lerp(new THREE.Color('#1e293b'), 0.06);

      // Balanced Hemisphere Light: Sky = vibrant cyan, Ground = sodium amber bounce
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(hemiLightRef.current.intensity, 0.78, 0.06);
      hemiLightRef.current.color.lerp(new THREE.Color('#38bdf8'), 0.06);
      hemiLightRef.current.groundColor.lerp(new THREE.Color('#ea580c'), 0.06);

      // Main directional light (soft cool moonlight & billboard spill)
      dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, 1.25, 0.06);
      dirLightRef.current.color.lerp(new THREE.Color('#7dd3fc'), 0.06);

      // Soft atmospheric horizon fog (not pitch black! luminous deep navy/slate haze)
      fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, 0.0085, 0.05);
      fogRef.current.color.lerp(new THREE.Color('#081122'), 0.06);
    }
  });

  return (
    <>
      {/* Deep atmospheric sky color */}
      <color attach="background" args={["#08101e"]} />
      
      {/* Low density atmospheric fog so skyscrapers and streets are clearly visible */}
      <fogExp2 ref={fogRef} attach="fog" args={["#081122", 0.0085]} />

      {/* Primary ambient lighting */}
      <ambientLight ref={ambientLightRef} intensity={0.52} color="#1e293b" />

      {/* Signature Blade Runner 2049 Dual-tone Hemisphere Light (Electric Cyan Sky / Sodium Amber Ground) */}
      <hemisphereLight
        ref={hemiLightRef}
        args={["#38bdf8", "#ea580c", 0.78]}
      />

      {/* High-angle directional light casting gentle shadows */}
      <directionalLight
        ref={dirLightRef}
        position={[35, 60, 30]}
        intensity={1.25}
        color="#7dd3fc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Secondary warm sodium rim light from industrial sector */}
      <directionalLight
        ref={rimLightRef}
        position={[-45, 35, -45]}
        intensity={0.85}
        color="#f97316"
      />

      {/* Sweeping Sky Searchlight Beams (LAPD / Wallace Corp surveillance in the rain) */}
      <group ref={searchlight1Ref} position={[0, 45, -25]}>
        <spotLight
          color="#38bdf8"
          intensity={8.0}
          distance={160}
          angle={0.22}
          penumbra={0.7}
        />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 3.5, 70, 16, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={searchlight2Ref} position={[-40, 40, 40]}>
        <spotLight
          color="#f43f5e"
          intensity={7.0}
          distance={150}
          angle={0.24}
          penumbra={0.65}
        />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 3.8, 65, 16, 1, true]} />
          <meshBasicMaterial
            color="#f43f5e"
            transparent
            opacity={0.11}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={searchlight3Ref} position={[45, 38, -30]}>
        <spotLight
          color="#fbbf24"
          intensity={6.5}
          distance={140}
          angle={0.2}
          penumbra={0.8}
        />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 3.2, 60, 16, 1, true]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.09}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Distant Megacity Horizon Silhouette Cylinder */}
      <mesh position={[0, 30, 0]}>
        <cylinderGeometry args={[130, 130, 90, 32, 1, true]} />
        <meshBasicMaterial
          color="#0a1528"
          side={THREE.BackSide}
          transparent
          opacity={0.6}
        />
      </mesh>
    </>
  );
}
