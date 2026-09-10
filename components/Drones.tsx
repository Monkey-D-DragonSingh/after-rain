"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Drones() {
  const spinner1Ref = useRef<THREE.Group>(null);
  const spinner2Ref = useRef<THREE.Group>(null);
  const spinner3Ref = useRef<THREE.Group>(null);
  const droneRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Spinner 1: Officer K / LAPD Police Spinner - high-altitude patrol over Central and Residential
    if (spinner1Ref.current) {
      const speed1 = t * 0.28;
      const x1 = Math.sin(speed1) * 42;
      const z1 = Math.cos(speed1 * 0.8) * 38;
      const y1 = 26 + Math.sin(speed1 * 2) * 2;
      spinner1Ref.current.position.set(x1, y1, z1);

      // Tangent heading & banking
      const dx1 = Math.cos(speed1) * 42;
      const dz1 = -Math.sin(speed1 * 0.8) * 38 * 0.8;
      spinner1Ref.current.rotation.y = Math.atan2(dx1, dz1);
      spinner1Ref.current.rotation.z = Math.sin(speed1) * 0.25; // Bank into turn
    }

    // Spinner 2: Civilian Aerocar - mid-altitude corridor (Central to Waterfront)
    if (spinner2Ref.current) {
      const speed2 = t * 0.22 + 2.5;
      const x2 = -25 + Math.cos(speed2) * 36;
      const z2 = 25 + Math.sin(speed2 * 0.9) * 42;
      const y2 = 20 + Math.cos(speed2 * 1.5) * 1.8;
      spinner2Ref.current.position.set(x2, y2, z2);

      const dx2 = -Math.sin(speed2) * 36;
      const dz2 = Math.cos(speed2 * 0.9) * 42 * 0.9;
      spinner2Ref.current.rotation.y = Math.atan2(dx2, dz2);
      spinner2Ref.current.rotation.z = -Math.cos(speed2) * 0.22;
    }

    // Spinner 3: Wallace Corporate Executive Aerocar - crossing east to west
    if (spinner3Ref.current) {
      const speed3 = t * 0.35 + 4.0;
      const x3 = Math.sin(speed3 * 0.7) * 55;
      const z3 = -20 + Math.cos(speed3 * 0.5) * 35;
      const y3 = 34 + Math.sin(speed3) * 1.5;
      spinner3Ref.current.position.set(x3, y3, z3);

      const dx3 = Math.cos(speed3 * 0.7) * 55 * 0.7;
      const dz3 = -Math.sin(speed3 * 0.5) * 35 * 0.5;
      spinner3Ref.current.rotation.y = Math.atan2(dx3, dz3);
      spinner3Ref.current.rotation.z = Math.sin(speed3 * 0.7) * 0.2;
    }

    // LAPD Surveillance Drone: Low altitude scan of the Old Quarter alleyways
    if (droneRef.current) {
      const speedD = t * 0.4;
      const xd = -50 + Math.sin(speedD) * 12;
      const zd = 18 + Math.cos(speedD * 1.2) * 12;
      const yd = 7.5 + Math.sin(speedD * 3) * 0.8;
      droneRef.current.position.set(xd, yd, zd);
      droneRef.current.rotation.y = speedD * 1.5;
    }
  });

  return (
    <group>
      {/* ================= 1. OFFICER K LAPD SPINNER ================= */}
      <group ref={spinner1Ref}>
        {/* Wedge Chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.8, 4.4]} />
          <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Aerodynamic Cockpit Canopy */}
        <mesh position={[0, 0.45, 0.2]}>
          <boxGeometry args={[1.7, 0.6, 2.2]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Underbody VTOL Thrusters */}
        {[-0.9, 0.9].map((tx, ti) => (
          <mesh key={ti} position={[tx, -0.4, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.3, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))}
        {/* Dual High-Power Front Headlights cutting through rain */}
        <mesh position={[-0.7, -0.1, 2.25]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.7, -0.1, 2.25]}>
          <boxGeometry args={[0.4, 0.2, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <spotLight
          position={[0, 0, 2.2]}
          angle={0.4}
          penumbra={0.6}
          intensity={6.0}
          color="#e0f2fe"
          distance={55}
          target-position={[0, -5, 30]}
        />
        {/* LAPD Blue/Red Strobe Bar on Roof */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.2, 0.15, 0.3]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[0, 0.9, 0]} color="#38bdf8" intensity={2.5} distance={15} />

        {/* Twin Red Ion Exhaust Thrusters */}
        {[-0.7, 0.7].map((ex, ei) => (
          <group key={ei} position={[ex, 0, -2.25]}>
            <mesh>
              <circleGeometry args={[0.25, 12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <pointLight color="#ef4444" intensity={2.0} distance={10} />
          </group>
        ))}
      </group>

      {/* ================= 2. CIVILIAN AMBER SPINNER ================= */}
      <group ref={spinner2Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 0.75, 4.0]} />
          <meshStandardMaterial color="#1e1b18" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.42, 0.1]}>
          <boxGeometry args={[1.5, 0.55, 2.0]} />
          <meshStandardMaterial
            color="#ea580c"
            emissive="#ea580c"
            emissiveIntensity={0.5}
            metalness={0.9}
          />
        </mesh>
        {/* Front Amber Beam */}
        <spotLight
          position={[0, 0, 2.0]}
          angle={0.35}
          penumbra={0.5}
          intensity={5.0}
          color="#fef08a"
          distance={45}
        />
        {/* Tail lights */}
        <mesh position={[0, 0, -2.05]}>
          <boxGeometry args={[1.6, 0.2, 0.1]} />
          <meshBasicMaterial color="#f97316" />
        </mesh>
      </group>

      {/* ================= 3. WALLACE EXECUTIVE SPINNER ================= */}
      <group ref={spinner3Ref}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.6, 0.7, 5.2]} />
          <meshStandardMaterial color="#111827" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.4, 0.3]}>
          <boxGeometry args={[1.9, 0.5, 2.6]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.4}
            metalness={0.9}
          />
        </mesh>
        {/* Forward Emerald/Cyan Searchlight */}
        <spotLight
          position={[0, -0.2, 2.6]}
          angle={0.3}
          penumbra={0.7}
          intensity={6.5}
          color="#67e8f9"
          distance={60}
        />
        <mesh position={[0, 0, -2.65]}>
          <boxGeometry args={[2.0, 0.15, 0.1]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
      </group>

      {/* ================= 4. LAPD ALLEY SCANNER DRONE ================= */}
      <group ref={droneRef}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#090d16" metalness={0.95} />
        </mesh>
        {/* Red Scanner Eye */}
        <mesh position={[0, 0, 0.55]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <spotLight
          position={[0, -0.3, 0.5]}
          angle={0.25}
          penumbra={0.4}
          intensity={4.0}
          color="#ef4444"
          distance={20}
        />
      </group>
    </group>
  );
}
