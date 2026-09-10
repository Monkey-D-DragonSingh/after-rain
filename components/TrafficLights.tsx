"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function TrafficLights() {
  const [lightState, setLightState] = useState<'red' | 'yellow' | 'green'>('green');
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;
    // 12s green, 3s yellow, 12s red cycle
    const cycle = timer.current % 27;
    if (cycle < 12) {
      if (lightState !== 'green') setLightState('green');
    } else if (cycle < 15) {
      if (lightState !== 'yellow') setLightState('yellow');
    } else {
      if (lightState !== 'red') setLightState('red');
    }
  });

  const gantries = [
    { pos: [0, 0, 18], rot: 0 },
    { pos: [18, 0, 0], rot: Math.PI / 2 },
    { pos: [-35, 0, 15], rot: 0 },
  ];

  return (
    <group>
      {gantries.map((g, idx) => (
        <group key={idx} position={g.pos as [number, number, number]} rotation={[0, g.rot, 0]}>
          {/* Support pole & overhead arm */}
          <mesh position={[-6, 4, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[-1.5, 7.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 9, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>

          {/* Traffic light housing box */}
          <mesh position={[0, 6.8, 0]}>
            <boxGeometry args={[0.6, 1.8, 0.5]} />
            <meshStandardMaterial color="#0b0f19" />
          </mesh>

          {/* Red Light */}
          <mesh position={[0, 7.3, 0.26]}>
            <circleGeometry args={[0.2, 16]} />
            <meshBasicMaterial
              color={lightState === 'red' ? '#ef4444' : '#450a0a'}
            />
          </mesh>

          {/* Yellow Light */}
          <mesh position={[0, 6.8, 0.26]}>
            <circleGeometry args={[0.2, 16]} />
            <meshBasicMaterial
              color={lightState === 'yellow' ? '#f59e0b' : '#451a03'}
            />
          </mesh>

          {/* Green Light */}
          <mesh position={[0, 6.3, 0.26]}>
            <circleGeometry args={[0.2, 16]} />
            <meshBasicMaterial
              color={lightState === 'green' ? '#10b981' : '#022c22'}
            />
          </mesh>

          {/* Reflective colored glow on wet pavement */}
          <pointLight
            position={[0, 4, 0]}
            color={
              lightState === 'red'
                ? '#ef4444'
                : lightState === 'yellow'
                ? '#f59e0b'
                : '#10b981'
            }
            intensity={0.8}
            distance={12}
          />
        </group>
      ))}
    </group>
  );
}
