"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";

const RAIN_COUNT = 5200;
const AREA = 150;
const HEIGHT = 52;
const RIPPLE_COUNT = 75;

interface Ripple {
  x: number;
  z: number;
  scale: number;
  speed: number;
}

function initRainPositions(): Float32Array {
  const arr = new Float32Array(RAIN_COUNT * 3);
  for (let i = 0; i < RAIN_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * AREA;
    arr[i * 3 + 1] = Math.random() * HEIGHT;
    arr[i * 3 + 2] = (Math.random() - 0.5) * AREA;
  }
  return arr;
}

function initRipples(): Ripple[] {
  return Array.from({ length: RIPPLE_COUNT }, () => ({
    x: (Math.random() - 0.5) * 80,
    z: (Math.random() - 0.5) * 80,
    scale: Math.random(),
    speed: 0.015 + Math.random() * 0.02,
  }));
}

export default function Rain() {
  const pointsRef = useRef<THREE.Points>(null);
  const ripplesRef = useRef<THREE.InstancedMesh>(null);
  const playerPos = useGameStore((s) => s.playerPos);
  const chapter = useGameStore((s) => s.chapter);

  const [positions] = useState(initRainPositions);

  const rippleDataRef = useRef<Ripple[] | null>(null);
  if (rippleDataRef.current == null) {
    rippleDataRef.current = initRipples();
  }

  const dummyRef = useRef<THREE.Object3D | null>(null);
  if (dummyRef.current == null) {
    dummyRef.current = new THREE.Object3D();
  }

  useFrame(() => {
    const isClearing = chapter === 5;

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      if (posAttr) {
        const fallSpeed = isClearing ? 0.35 : 0.85;
        for (let i = 0; i < RAIN_COUNT; i++) {
          let y = posAttr.getY(i) - fallSpeed;
          if (y < 0) {
            y = HEIGHT;
            posAttr.setX(i, playerPos[0] + (Math.random() - 0.5) * AREA);
            posAttr.setZ(i, playerPos[2] + (Math.random() - 0.5) * AREA);
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      const mat = pointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        const targetOpacity = isClearing ? 0.08 : 0.45;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.05);
      }
    }

    // Animate ground ripples
    if (ripplesRef.current && rippleDataRef.current && dummyRef.current) {
      const ripples = rippleDataRef.current;
      const dummy = dummyRef.current;

      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const r = ripples[i];
        r.scale += r.speed;
        if (r.scale > 1.2) {
          r.scale = 0.05;
          r.x = playerPos[0] + (Math.random() - 0.5) * 60;
          r.z = playerPos[2] + (Math.random() - 0.5) * 60;
        }
        dummy.position.set(r.x, 0.05, r.z);
        dummy.rotation.x = -Math.PI / 2;
        const currentScale = r.scale * 0.9;
        dummy.scale.set(currentScale, currentScale, 1);
        dummy.updateMatrix();
        ripplesRef.current.setMatrixAt(i, dummy.matrix);
      }
      ripplesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Rain droplets */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#bae6fd"
          size={0.14}
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Rain puddles ripple rings */}
      <instancedMesh
        ref={ripplesRef}
        args={[undefined, undefined, RIPPLE_COUNT]}
      >
        <ringGeometry args={[0.22, 0.4, 16]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}