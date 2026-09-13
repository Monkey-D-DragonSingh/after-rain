'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import {
  TILE_SIZE,
  ACTIVE_RADIUS,
  worldToTile,
  getActiveTileKeys,
  generateTileContent,
} from '@/lib/worldGrid';

function Tile({ tx, tz }: { tx: number; tz: number }) {
  const worldX = tx * TILE_SIZE;
  const worldZ = tz * TILE_SIZE;

  // generateTileContent is a pure function of (tx, tz) — same seed in,
  // same buildings out, every time. Safe to call during render like this;
  // useMemo just avoids recomputing it on every re-render of this tile.
  const { buildings, streetLights, groundColor } = useMemo(
    () => generateTileContent(tx, tz),
    [tx, tz]
  );

  return (
    <group position={[worldX, 0, worldZ]}>
      {/* Ground slab for this tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TILE_SIZE / 2, 0, TILE_SIZE / 2]} receiveShadow>
        <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
        <meshStandardMaterial color={groundColor} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Buildings — instanced so N buildings in this tile cost ~1 draw call */}
      <Instances limit={buildings.length || 1} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.3} />
        {buildings.map((b, i) => (
          <Instance
            key={i}
            position={b.position}
            scale={b.size}
            color={b.color}
          />
        ))}
      </Instances>

      {/* Street lights — thin emissive poles marking empty plots */}
      <Instances limit={streetLights.length || 1}>
        <cylinderGeometry args={[0.15, 0.15, 6, 6]} />
        <meshStandardMaterial
          color="#3fd9ff"
          emissive="#3fd9ff"
          emissiveIntensity={1.2}
        />
        {streetLights.map((s, i) => (
          <Instance key={i} position={[s.position[0], 3, s.position[2]]} />
        ))}
      </Instances>
    </group>
  );
}

export default function WorldManager() {
  // NOTE: This uses the camera's position as a stand-in for the player's position,
  // which works fine for first-person exploration. If you track player position
  // separately (e.g. in a zustand store or a character controller ref), replace
  // the two lines below with that source instead.
  const { camera } = useThree();

  const [activeTiles, setActiveTiles] = useState<string[]>([]);
  const lastTile = useRef({ tx: Infinity, tz: Infinity });

  useFrame(() => {
    const { x, z } = camera.position;
    const { tx, tz } = worldToTile(x, z);

    if (tx !== lastTile.current.tx || tz !== lastTile.current.tz) {
      lastTile.current = { tx, tz };
      setActiveTiles(getActiveTileKeys(tx, tz, ACTIVE_RADIUS));
    }
  });

  return (
    <>
      {activeTiles.map((key) => {
        const [tx, tz] = key.split('_').map(Number);
        return <Tile key={key} tx={tx} tz={tz} />;
      })}
    </>
  );
}
