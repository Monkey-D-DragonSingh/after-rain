'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

// Procedural soft cloud puff texture generator
function createCloudTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 256, 256);

  // Layered soft radial gradients for realistic organic cloud puff
  const puffs = [
    { x: 128, y: 128, r: 110, a: 0.55 },
    { x: 95, y: 110, r: 75, a: 0.45 },
    { x: 160, y: 115, r: 80, a: 0.42 },
    { x: 110, y: 155, r: 70, a: 0.4 },
    { x: 150, y: 150, r: 75, a: 0.38 },
    { x: 128, y: 90, r: 60, a: 0.35 },
  ];

  for (const p of puffs) {
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(220, 235, 255, ${p.a})`);
    grad.addColorStop(0.45, `rgba(180, 205, 235, ${p.a * 0.75})`);
    grad.addColorStop(0.8, `rgba(120, 150, 190, ${p.a * 0.4})`);
    grad.addColorStop(1, 'rgba(20, 35, 60, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Deterministic pseudo-random generator (pure: same seed -> same output).
// Replaces Math.random() so cloud generation stays a pure function of its inputs,
// satisfying the react-hooks/purity rule for values computed during render.
function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface CloudInstance {
  pos: [number, number, number];
  scale: [number, number, number];
  rotZ: number;
  rotSpeed: number;
  driftSpeedX: number;
  driftSpeedZ: number;
  initialX: number;
  initialZ: number;
}

export default function Clouds() {
  const thunderFlash = useGameStore((s) => s.thunderFlash);
  const chapter = useGameStore((s) => s.chapter);
  const weather = useGameStore((s) => s.weather);

  const cloudTex = useMemo(() => createCloudTexture(), []);

  const lowCloudRef = useRef<THREE.Group>(null);
  const midCloudRef = useRef<THREE.Group>(null);
  const highDomeRef = useRef<THREE.Mesh>(null);

  // Generate low-altitude smog wisps drifting between skyscrapers (Y: 20 to 38)
  const lowClouds = useMemo<CloudInstance[]>(() => {
    const list: CloudInstance[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.sin(i * 3) * 0.5;
      const radius = 25 + (Math.sin(i * 11) * 0.5 + 0.5) * 45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 22 + (i % 6) * 3;
      const s = 18 + (i % 5) * 6;
      list.push({
        pos: [x, y, z],
        scale: [s, s * 0.6, s],
        rotZ: seededRandom(i * 4 + 1) * Math.PI * 2,
        rotSpeed: (seededRandom(i * 4 + 2) - 0.5) * 0.02,
        driftSpeedX: 0.4 + seededRandom(i * 4 + 3) * 0.4,
        driftSpeedZ: 0.15 + seededRandom(i * 4 + 4) * 0.25,
        initialX: x,
        initialZ: z,
      });
    }
    return list;
  }, []);

  // Generate dense mid-altitude rolling storm cloud ceiling (Y: 55 to 85)
  const midClouds = useMemo<CloudInstance[]>(() => {
    const list: CloudInstance[] = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + (i % 3) * 0.4;
      const radius = 15 + ((i * 7) % 80);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 55 + (i % 8) * 3.8;
      const s = 34 + (i % 6) * 10;
      list.push({
        pos: [x, y, z],
        scale: [s, s * 0.5, s],
        rotZ: seededRandom(10000 + i * 4 + 1) * Math.PI * 2,
        rotSpeed: (seededRandom(10000 + i * 4 + 2) - 0.5) * 0.015,
        driftSpeedX: 0.3 + (i % 4) * 0.12,
        driftSpeedZ: 0.2 + (i % 3) * 0.1,
        initialX: x,
        initialZ: z,
      });
    }
    return list;
  }, []);

  // Frame update: drift and rotation of clouds
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Low smog drifting between towers
    if (lowCloudRef.current) {
      lowCloudRef.current.children.forEach((child, i) => {
        const item = lowClouds[i];
        if (!item) return;
        child.position.x = ((item.initialX + t * item.driftSpeedX + 120) % 240) - 120;
        child.position.z = ((item.initialZ + t * item.driftSpeedZ + 120) % 240) - 120;
        child.rotation.z += item.rotSpeed * 0.01;
      });
    }

    // Mid storm clouds rolling across the sky
    if (midCloudRef.current) {
      midCloudRef.current.children.forEach((child, i) => {
        const item = midClouds[i];
        if (!item) return;
        child.position.x = ((item.initialX + t * item.driftSpeedX + 160) % 320) - 160;
        child.position.z = ((item.initialZ + t * item.driftSpeedZ + 160) % 320) - 160;
        child.rotation.z += item.rotSpeed * 0.008;
      });
    }

    // High storm dome slow majestic revolution
    if (highDomeRef.current) {
      highDomeRef.current.rotation.y = t * 0.006;
    }
  });

  const isDawn = chapter === 5 || weather === 'dawn';

  // Dynamic cloud color and illumination
  const cloudColor = thunderFlash
    ? '#e0e7ff' // Brilliant lightning flash
    : isDawn
    ? '#fb923c' // Warm sunrise breaking through
    : '#1e293b'; // Dystopian Los Angeles 2049 overcast slate

  const cloudOpacity = thunderFlash ? 0.85 : isDawn ? 0.35 : 0.55;

  return (
    <group>
      {/* ================= 1. LOW SMOG & NEON VAPOR LAYER (Y: 20-38) ================= */}
      <group ref={lowCloudRef}>
        {lowClouds.map((c, i) => (
          <mesh
            key={`low-cloud-${i}`}
            position={c.pos}
            rotation={[-Math.PI / 2 + 0.15, 0, c.rotZ]}
            scale={c.scale}
          >
            <planeGeometry args={[1, 1]} />
            {cloudTex && (
              <meshBasicMaterial
                map={cloudTex}
                transparent
                opacity={thunderFlash ? 0.75 : 0.28}
                color={
                  thunderFlash
                    ? '#ffffff'
                    : i % 3 === 0
                    ? '#38bdf8' // Cyan city reflection
                    : i % 3 === 1
                    ? '#f43f5e' // Magenta Joi hologram reflection
                    : '#fbbf24' // Sodium amber street light bounce
                }
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        ))}
      </group>

      {/* ================= 2. MID-ALTITUDE STORM CLOUD CEILING (Y: 55-85) ================= */}
      <group ref={midCloudRef}>
        {midClouds.map((c, i) => (
          <mesh
            key={`mid-cloud-${i}`}
            position={c.pos}
            rotation={[-Math.PI / 2 + 0.1, 0, c.rotZ]}
            scale={c.scale}
          >
            <planeGeometry args={[1, 1]} />
            {cloudTex && (
              <meshBasicMaterial
                map={cloudTex}
                transparent
                opacity={cloudOpacity}
                color={cloudColor}
                depthWrite={false}
                blending={thunderFlash ? THREE.AdditiveBlending : THREE.NormalBlending}
                side={THREE.DoubleSide}
              />
            )}
          </mesh>
        ))}
      </group>

      {/* ================= 3. UPPER OVERCAST STORM STRATUM DOME (Y: 95-125) ================= */}
      <mesh
        ref={highDomeRef}
        position={[0, 45, 0]}
        rotation={[0, 0, 0]}
      >
        <sphereGeometry args={[165, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        <meshStandardMaterial
          color={thunderFlash ? '#475569' : isDawn ? '#431407' : '#0c1524'}
          emissive={thunderFlash ? '#93c5fd' : isDawn ? '#7c2d12' : '#070d18'}
          emissiveIntensity={thunderFlash ? 2.5 : 0.35}
          side={THREE.BackSide}
          roughness={0.9}
        />
      </mesh>

      {/* Volumetric horizontal cloud deck slab */}
      <mesh position={[0, 88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[260, 260]} />
        {cloudTex && (
          <meshBasicMaterial
            map={cloudTex}
            transparent
            opacity={thunderFlash ? 0.8 : 0.4}
            color={cloudColor}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
    </group>
  );
}
