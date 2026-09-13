'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TILE_SIZE, ACTIVE_RADIUS, worldToTile, getActiveTileKeys, tileSeed } from '@/lib/worldGrid';

function Tile({ tx, tz }: { tx: number; tz: number }) {
  const seed = tileSeed(tx, tz);
  const worldX = tx * TILE_SIZE;
  const worldZ = tz * TILE_SIZE;

  // Placeholder content for now — this is where procedural buildings,
  // instanced windows, cats, etc. will eventually be generated using `seed`.
  return (
    <group position={[worldX, 0, worldZ]}>
      <mesh position={[TILE_SIZE / 2, 5, TILE_SIZE / 2]}>
        <boxGeometry args={[10, 10, 10]} />
        <meshStandardMaterial color={seed % 2 === 0 ? 'orange' : 'skyblue'} />
      </mesh>
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