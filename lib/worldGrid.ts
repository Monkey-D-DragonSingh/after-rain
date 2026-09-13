// Configurable size of each square tile in world units.
export const TILE_SIZE = 200;

// How many tiles out from the player's current tile should stay active.
// radius = 1 -> 3x3 grid, radius = 2 -> 5x5, radius = 3 -> 7x7, etc.
// Atmosphere.tsx's fogExp2 density (~0.0085) makes anything past roughly
// ~200 world units fully obscured, so keep this radius matched to that —
// otherwise you're rendering buildings the fog hides anyway, for free FPS loss.
// At TILE_SIZE=200, radius=1 covers exactly one tile of visible buffer
// past the fog line; bump it only if you loosen the fog density too.
export const ACTIVE_RADIUS = 1;

// How many buildings per axis inside a single tile (BUILDINGS_PER_AXIS^2 total).
export const BUILDINGS_PER_AXIS = 4;

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
  // >>> 0 forces an unsigned 32-bit int so it's always a positive seed.
  return ((tx * 73856093) ^ (tz * 19349663)) >>> 0;
}

// --- Seeded PRNG -----------------------------------------------------------
// Math.random() is impure (different result every call, breaks React's
// purity rules and would make tiles regenerate differently on every
// re-render). mulberry32 is a small, fast, fully deterministic PRNG:
// same seed in -> same sequence of numbers out, every time.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seed: number) {
  return mulberry32(seed);
}

// --- Per-tile content generation --------------------------------------------

export type Building = {
  position: [number, number, number]; // relative to tile origin
  size: [number, number, number];
  color: string;
  emissiveIntensity: number;
};

export type StreetLight = {
  position: [number, number, number]; // relative to tile origin
};

export type TileContent = {
  buildings: Building[];
  streetLights: StreetLight[];
  groundColor: string;
};

const NEON_COLORS = ["#1a1a2e", "#16213e", "#0f3460", "#1b1b2f", "#22223b"];
const GROUND_COLORS = ["#0a0a12", "#0c0c16", "#0e0e18"];

// Pure function: same (tx, tz) always produces the exact same tile content.
// Safe to call directly during render (e.g. inside useMemo keyed on the seed).
export function generateTileContent(tx: number, tz: number): TileContent {
  const seed = tileSeed(tx, tz);
  const rand = createSeededRandom(seed);

  const buildings: Building[] = [];
  const streetLights: StreetLight[] = [];

  const cell = TILE_SIZE / BUILDINGS_PER_AXIS;

  for (let ix = 0; ix < BUILDINGS_PER_AXIS; ix++) {
    for (let iz = 0; iz < BUILDINGS_PER_AXIS; iz++) {
      // Leave gaps for streets — skip some plots.
      if (rand() < 0.2) {
        // Empty plot: maybe place a street light instead.
        if (rand() < 0.5) {
          streetLights.push({
            position: [
              ix * cell + cell / 2,
              0,
              iz * cell + cell / 2,
            ],
          });
        }
        continue;
      }

      const height = 4 + rand() * 24;
      const footprint = cell * 0.5 + rand() * (cell * 0.3);

      buildings.push({
        position: [
          ix * cell + cell / 2,
          height / 2,
          iz * cell + cell / 2,
        ],
        size: [footprint, height, footprint],
        color: NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)],
        emissiveIntensity: rand() > 0.6 ? 0.15 : 0.02,
      });
    }
  }

  const groundColor = GROUND_COLORS[Math.floor(rand() * GROUND_COLORS.length)];

  return { buildings, streetLights, groundColor };
}
