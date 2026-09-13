// Configurable size of each square tile in world units.
export const TILE_SIZE = 200;

// How many tiles out from the player's current tile should stay active.
// radius = 1 -> 3x3 grid, radius = 2 -> 5x5 grid, etc.
export const ACTIVE_RADIUS = 1;

export function worldToTile(x: number, z: number) {
  return {
    tx: Math.floor(x / TILE_SIZE),
    tz: Math.floor(z / TILE_SIZE),
  };
}

export function getActiveTileKeys(centerTx: number, centerTz: number, radius: number): string[] {
  const tiles: string[] = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      tiles.push(`${centerTx + dx}_${centerTz + dz}`);
    }
  }
  return tiles;
}

// Deterministic per-tile seed so the same tile always regenerates identically,
// even after being unloaded and reloaded.
export function tileSeed(tx: number, tz: number): number {
  return (tx * 73856093) ^ (tz * 19349663);
}