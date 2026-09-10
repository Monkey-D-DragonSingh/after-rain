"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Procedural high-res window texture with illuminated amber/cyan windows and blinds
function createWindowTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#080c16";
  ctx.fillRect(0, 0, 512, 512);

  const cols = 16;
  const rows = 32;
  const w = 512 / cols;
  const h = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rand = Math.sin(r * 23 + c * 37) * 10000;
      const frac = rand - Math.floor(rand);

      if (frac < 0.22) continue; // dark unlit office

      if (frac < 0.68) {
        // Warm sodium amber window (Blade Runner signature)
        ctx.fillStyle = frac < 0.48 ? "#fbbf24" : "#f59e0b";
      } else if (frac < 0.88) {
        // Cool electric cyan / CRT window
        ctx.fillStyle = "#38bdf8";
      } else {
        // Bright fluorescent white
        ctx.fillStyle = "#e0f2fe";
      }

      ctx.fillRect(c * w + 3.5, r * h + 3, w - 7, h - 6);

      // Window blinds shadow
      if (frac > 0.45) {
        ctx.fillStyle = "rgba(8, 12, 22, 0.45)";
        ctx.fillRect(c * w + 3.5, r * h + h * 0.45, w - 7, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Giant Holographic Joi Silhouette texture (Blade Runner 2049 "You look like a good Joe")
function createJoiTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 256, 512);

  // Outer volumetric aura
  const grad = ctx.createRadialGradient(128, 230, 30, 128, 230, 170);
  grad.addColorStop(0, "rgba(244, 63, 94, 0.4)");
  grad.addColorStop(0.5, "rgba(217, 70, 239, 0.2)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Hologram head & hair silhouette
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.arc(128, 85, 26, 0, Math.PI * 2);
  ctx.fill();

  // Flowing hair/ponytail
  ctx.beginPath();
  ctx.moveTo(112, 80);
  ctx.quadraticCurveTo(80, 120, 95, 175);
  ctx.lineTo(122, 110);
  ctx.fillStyle = "#ec4899";
  ctx.fill();

  // Slender torso and legs
  ctx.beginPath();
  ctx.moveTo(118, 110);
  ctx.lineTo(138, 110);
  ctx.lineTo(160, 145);
  ctx.lineTo(148, 220);
  ctx.lineTo(142, 290);
  ctx.lineTo(152, 470);
  ctx.lineTo(104, 470);
  ctx.lineTo(114, 290);
  ctx.lineTo(108, 220);
  ctx.lineTo(96, 145);
  ctx.closePath();
  ctx.fillStyle = "#f472b6";
  ctx.fill();

  // High-intensity spine glow
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 110);
  ctx.lineTo(128, 460);
  ctx.stroke();

  // Horizontal Hologram Scanlines
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 256, 2);
  }

  // Japanese typography: ジョイ (Joi)
  ctx.font = "bold 24px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("ジョイ // JOI", 45, 485);
  ctx.font = "12px monospace";
  ctx.fillStyle = "#f472b6";
  ctx.fillText("ANYTHING YOU WANT TO HEAR", 24, 504);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Wallace Corp synthetic systems billboard texture
function createWallaceTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#080b14";
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  // Background tech grid
  ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
  ctx.lineWidth = 1;
  for (let x = 20; x < 500; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, 246);
    ctx.stroke();
  }
  for (let y = 20; y < 246; y += 28) {
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(502, y);
    ctx.stroke();
  }

  // Logo text
  ctx.fillStyle = "#fbbf24";
  ctx.font = "900 38px monospace";
  ctx.fillText("WALLACE CORP", 100, 85);

  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#f97316";
  ctx.fillText("SYNTHETIC LIFE // OFF-WORLD COLONIES", 55, 125);

  ctx.font = "14px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("NEXUS-9 CELL INTEGRATION // SECTOR 04", 75, 165);

  // Waveform bars
  for (let i = 0; i < 36; i++) {
    const barH = 12 + Math.sin(i * 0.7) * 10;
    ctx.fillStyle = i % 2 === 0 ? "#fbbf24" : "#38bdf8";
    ctx.fillRect(75 + i * 10, 210 - barH / 2, 7, barH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// White Dragon Noodle Bar neon sign texture
function createNoodleTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = "#f43f5e";
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 244, 116);

  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#f43f5e";
  ctx.fillText("ホワイト・ドラゴン", 18, 55);

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("NOODLE BAR // 2049", 25, 95);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Residential Esperanza Tenement Windows (high density, warm curtains, TV blue flicker)
function createResidentialWindowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0a0d16";
  ctx.fillRect(0, 0, 512, 512);

  const cols = 20;
  const rows = 32;
  const w = 512 / cols;
  const h = 512 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rand = Math.sin(r * 31.3 + c * 17.9) * 10000;
      const frac = rand - Math.floor(rand);

      if (frac < 0.3) continue;

      if (frac < 0.72) {
        ctx.fillStyle = frac < 0.5 ? "#f59e0b" : "#d97706";
      } else if (frac < 0.88) {
        ctx.fillStyle = "#0284c7";
      } else {
        ctx.fillStyle = "#f43f5e";
      }

      ctx.fillRect(c * w + 2.5, r * h + 2, w - 5, h - 4);

      if (frac > 0.5) {
        ctx.fillStyle = "rgba(10, 13, 22, 0.65)";
        ctx.fillRect(c * w + 2.5, r * h + 2, (w - 5) * 0.35, h - 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Retro Atari Neon Billboard
function createAtariTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#080a14";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#f43f5e";
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, 244, 244);

  // Fuji logo
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(120, 45, 16, 110);

  ctx.beginPath();
  ctx.moveTo(95, 155);
  ctx.quadraticCurveTo(90, 75, 55, 60);
  ctx.lineTo(70, 60);
  ctx.quadraticCurveTo(105, 75, 110, 155);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(161, 155);
  ctx.quadraticCurveTo(166, 75, 201, 60);
  ctx.lineTo(186, 60);
  ctx.quadraticCurveTo(151, 75, 146, 155);
  ctx.closePath();
  ctx.fill();

  ctx.font = "900 32px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("ATARI", 72, 205);

  ctx.font = "12px monospace";
  ctx.fillStyle = "#f43f5e";
  ctx.fillText("アタリ // 2049 DIGITAL", 42, 230);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Reusable Blade Runner Neon Kanji Sign
function createKanjiTexture(mainText: string, subText: string, colorHex: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#080912";
  ctx.fillRect(0, 0, 128, 256);

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 120, 248);

  ctx.fillStyle = colorHex;
  ctx.font = "bold 28px sans-serif";
  const chars = mainText.split("");
  chars.forEach((c, idx) => {
    ctx.fillText(c, 48, 55 + idx * 42);
  });

  ctx.font = "11px monospace";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(subText, 16, 235);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Cyberpunk Vending Machine Texture
function createVendingTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 128, 256);

  ctx.fillStyle = "#0369a1";
  ctx.fillRect(10, 15, 108, 145);

  const canColors = ["#ef4444", "#38bdf8", "#10b981", "#f59e0b"];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillStyle = canColors[(r + c) % canColors.length];
      ctx.fillRect(20 + c * 32, 25 + r * 32, 22, 26);
    }
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(16, 185, 96, 45);

  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("SYNTH-DRINK", 16, 175);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper: 4-sided Window Mesh for any building so all sides are richly detailed
function FourSidedWindows({
  size,
  texture,
  emissiveColor = "#ffffff",
  emissiveIntensity = 0.8,
}: {
  size: [number, number, number];
  texture: THREE.CanvasTexture | null;
  emissiveColor?: string;
  emissiveIntensity?: number;
}) {
  if (!texture) return null;
  const [w, h, d] = size;
  const offset = 0.04;

  return (
    <group>
      {/* Front (+Z) */}
      <mesh position={[0, 0, d / 2 + offset]}>
        <planeGeometry args={[w * 0.94, h * 0.94]} />
        <meshStandardMaterial
          map={texture}
          emissive={emissiveColor}
          emissiveMap={texture}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
        />
      </mesh>
      {/* Back (-Z) */}
      <mesh position={[0, 0, -d / 2 - offset]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w * 0.94, h * 0.94]} />
        <meshStandardMaterial
          map={texture}
          emissive={emissiveColor}
          emissiveMap={texture}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
        />
      </mesh>
      {/* Right (+X) */}
      <mesh position={[w / 2 + offset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d * 0.94, h * 0.94]} />
        <meshStandardMaterial
          map={texture}
          emissive={emissiveColor}
          emissiveMap={texture}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
        />
      </mesh>
      {/* Left (-X) */}
      <mesh position={[-w / 2 - offset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d * 0.94, h * 0.94]} />
        <meshStandardMaterial
          map={texture}
          emissive={emissiveColor}
          emissiveMap={texture}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function Districts() {
  const oceanRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Group>(null);
  const joiRef = useRef<THREE.Group>(null);
  const billboardRef = useRef<THREE.MeshBasicMaterial>(null);
  const steamRef = useRef<THREE.Group>(null);
  const strobeRef = useRef<THREE.PointLight>(null);

  // Generate procedural textures once
  const winTex = useMemo(() => createWindowTexture(), []);
  const joiTex = useMemo(() => createJoiTexture(), []);
  const wallaceTex = useMemo(() => createWallaceTexture(), []);
  const noodleTex = useMemo(() => createNoodleTexture(), []);

  // Building geometry configurations for Central District
  const centralBuildings = useMemo(() => {
    return [
      // Wallace Corp Monolith (Stepped pyramid tower)
      { pos: [0, 36, -26], size: [22, 72, 20], color: "#0c1322", emissive: "#0369a1", repeat: [2, 5], name: "Wallace Monolith" },
      // LAPD Spire
      { pos: [-18, 28, -14], size: [14, 56, 14], color: "#0b1526", emissive: "#0284c7", repeat: [1.5, 4], name: "LAPD Tower" },
      // Cyber Spires
      { pos: [18, 30, -12], size: [14, 60, 16], color: "#0a1120", emissive: "#38bdf8", repeat: [1.5, 4.5], name: "Nexus Tower" },
      { pos: [-20, 24, 18], size: [16, 48, 14], color: "#0d182a", emissive: "#0ea5e9", repeat: [1.5, 3.5], name: "Esper Spire" },
      { pos: [22, 22, 20], size: [14, 44, 14], color: "#0f1c32", emissive: "#0369a1", repeat: [1.5, 3], name: "Tyrell Archive" },
      { pos: [30, 16, 0], size: [10, 32, 12], color: "#0a1222", emissive: "#38bdf8", repeat: [1, 2.5], name: "Sector Sub-01" },
    ];
  }, []);

  // Old Quarter Buildings (Bibi's Bar / Noodle Market)
  const oldQuarterBuildings = useMemo(() => {
    return [
      { pos: [-42, 8, 8], size: [10, 16, 10], color: "#161318", neon: "#f43f5e" },
      { pos: [-56, 9, 6], size: [12, 18, 12], color: "#1a141b", neon: "#fb7185" },
      { pos: [-44, 7, 24], size: [9, 14, 11], color: "#141015", neon: "#e11d48" },
      { pos: [-60, 10, 22], size: [13, 20, 14], color: "#120f14", neon: "#fda4af" },
      { pos: [-48, 8, 38], size: [10, 16, 10], color: "#18131a", neon: "#f43f5e" },
      { pos: [-66, 9, 36], size: [11, 18, 11], color: "#171219", neon: "#be123c" },
      { pos: [-36, 12, -4], size: [8, 24, 8], color: "#151118", neon: "#f43f5e" },
    ];
  }, []);

  // Residential Towers (High-Density Esperanza Tenements)
  const residentialBuildings = useMemo(() => {
    return [
      { pos: [38, 26, -45], size: [14, 52, 14], color: "#131722", repeat: [1.5, 4] },
      { pos: [56, 32, -40], size: [16, 64, 16], color: "#0f141f", repeat: [2, 5] },
      { pos: [45, 22, -62], size: [14, 44, 14], color: "#121824", repeat: [1.5, 3.5] },
      { pos: [64, 28, -64], size: [14, 56, 14], color: "#0d121c", repeat: [1.5, 4.2] },
      { pos: [26, 18, -50], size: [10, 36, 10], color: "#141926", repeat: [1, 2.8] },
    ];
  }, []);

  // Industrial Structures (Wallace Protein / Power Cooling Towers)
  const industrialStructures = useMemo(() => {
    return [
      { pos: [62, 16, 18], rTop: 4.2, rBot: 6.8, h: 32 },
      { pos: [82, 18, 36], rTop: 5.0, rBot: 7.5, h: 36 },
      { pos: [54, 12, 42], rTop: 3.5, rBot: 5.5, h: 24 },
    ];
  }, []);

  // Street Lamps layout along avenues for high observability
  const streetLamps = useMemo(() => {
    return [
      // Central Avenue
      [-6, 0, 10], [6, 0, 10],
      [-6, 0, -10], [6, 0, -10],
      [-6, 0, 28], [6, 0, 28],
      [-6, 0, -28], [6, 0, -28],
      // East-West Crossing
      [18, 0, 6], [18, 0, -6],
      [-18, 0, 6], [-18, 0, -6],
      // Old Quarter Alley
      [-36, 0, 12], [-48, 0, 22], [-60, 0, 16],
      // Residential Walkway
      [36, 0, -32], [48, 0, -48],
    ];
  }, []);

  // Animation frame loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Waterfront Beacon Rotation
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 0.75;
    }

    // Holographic Joi subtle floating & scanline drift
    if (joiRef.current) {
      joiRef.current.position.y = 22 + Math.sin(t * 1.2) * 0.4;
      joiRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    }

    // Billboard Glitch Pulse
    if (billboardRef.current) {
      billboardRef.current.opacity = 0.88 + Math.sin(t * 6) * 0.1;
    }

    // Red FAA Collision Strobe Light blinking on central spire
    if (strobeRef.current) {
      strobeRef.current.intensity = (Math.floor(t * 2) % 2 === 0) ? 3.5 : 0.2;
    }

    // Industrial Steam rising
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        child.position.y = 12 + ((t * 2.5 + i * 2.5) % 15);
        const s = 1.2 + ((t * 0.6 + i) % 3.5);
        child.scale.set(s, s, s);
      });
    }
  });

  return (
    <group>
      {/* ================= 1. WET REFLECTIVE ASPHALT ROADBED ================= */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[280, 280]} />
        <meshStandardMaterial
          color="#0a0d15"
          roughness={0.12}
          metalness={0.75}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Main North-South Cyber Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[14, 200]} />
        <meshStandardMaterial color="#0f1523" roughness={0.15} metalness={0.6} />
      </mesh>
      {/* Center Double Yellow Divider Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.15, 0.03, 0]}>
        <planeGeometry args={[0.15, 190]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.03, 0]}>
        <planeGeometry args={[0.15, 190]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Main East-West Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, 0]}>
        <planeGeometry args={[14, 200]} />
        <meshStandardMaterial color="#0f1523" roughness={0.15} metalness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.03, -0.15]}>
        <planeGeometry args={[0.15, 190]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.03, 0.15]}>
        <planeGeometry args={[0.15, 190]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Pedestrian Zebra Crossings at Central Intersection */}
      {[-8, 8].map((zPos, i) => (
        <group key={`cross-z-${i}`} position={[0, 0.03, zPos]}>
          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[(j - 3.5) * 1.5, 0, 0]}>
              <planeGeometry args={[0.8, 2.5]} />
              <meshBasicMaterial color="#cbd5e1" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Street Hazard Curbs (Yellow/Black Diagonal Stripes) */}
      {[-7.2, 7.2].map((cx, i) => (
        <mesh key={`curb-${i}`} position={[cx, 0.1, 0]}>
          <boxGeometry args={[0.3, 0.2, 180]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      ))}

      {/* Street Puddle Decals with Additive Neon Reflection */}
      {[
        { pos: [3.5, 0.035, 6], color: "#38bdf8", size: [5, 8] },
        { pos: [-4, 0.035, 16], color: "#f43f5e", size: [6, 5] },
        { pos: [10, 0.035, -14], color: "#fbbf24", size: [7, 7] },
        { pos: [-40, 0.035, 18], color: "#ec4899", size: [5, 10] },
        { pos: [44, 0.035, -36], color: "#f59e0b", size: [6, 8] },
        { pos: [-16, 0.035, -45], color: "#a855f7", size: [6, 6] },
      ].map((p, i) => (
        <mesh key={`puddle-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={p.pos as [number, number, number]}>
          <planeGeometry args={p.size as [number, number]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* ================= 2. STREET LIGHTING SYSTEM (HIGH OBSERVABILITY) ================= */}
      {streetLamps.map(([lx, ly, lz], i) => (
        <group key={`lamp-${i}`} position={[lx, ly, lz]}>
          {/* Base & Tall Metal Pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 6, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Curved Bracket Arm */}
          <mesh position={[lx > 0 ? -0.8 : 0.8, 5.8, 0]} rotation={[0, 0, lx > 0 ? -0.4 : 0.4]}>
            <cylinderGeometry args={[0.08, 0.08, 1.8, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Glowing Sodium Light Fixture */}
          <mesh position={[lx > 0 ? -1.4 : 1.4, 5.5, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.4]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Bright Warm Sodium Ground Pool Light */}
          <pointLight
            position={[lx > 0 ? -1.4 : 1.4, 5.2, 0]}
            color="#fbbf24"
            intensity={1.6}
            distance={16}
          />
        </group>
      ))}

      {/* Street-level Steaming Manholes */}
      {[-8, 14, -38, 40].map((mx, idx) => (
        <group key={`manhole-${idx}`} position={[mx, 0.03, (idx % 2 === 0 ? 8 : -18)]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.9} />
          </mesh>
          {/* Steam underlight */}
          <pointLight position={[0, 0.4, 0]} color="#fb923c" intensity={0.8} distance={4} />
        </group>
      ))}

      {/* ================= 3. CENTRAL DISTRICT (BLADE RUNNER 2049 MONOLITHS) ================= */}
      <group>
        {centralBuildings.map((b, i) => (
          <group key={`cen-b-${i}`} position={b.pos as [number, number, number]}>
            {/* Monolithic Building Core */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={b.size as [number, number, number]} />
              <meshStandardMaterial
                color={b.color}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>

            {/* Illuminated Window Matrix using procedural texture */}
            {winTex && (
              <mesh position={[0, 0, (b.size[2] / 2) + 0.05]}>
                <planeGeometry args={[b.size[0] * 0.92, b.size[1] * 0.92]} />
                <meshStandardMaterial
                  map={winTex}
                  emissive="#ffffff"
                  emissiveMap={winTex}
                  emissiveIntensity={0.8}
                  roughness={0.4}
                />
              </mesh>
            )}

            {/* Rooftop Stepped Architectural Crown */}
            <mesh position={[0, (b.size[1] / 2) + 1.5, 0]}>
              <boxGeometry args={[b.size[0] * 0.75, 3, b.size[2] * 0.75]} />
              <meshStandardMaterial color="#0b1322" metalness={0.85} />
            </mesh>

            {/* Rooftop Machinery (HVAC ducting & chiller units) */}
            <mesh position={[b.size[0] * 0.2, (b.size[1] / 2) + 3.8, b.size[2] * 0.2]}>
              <boxGeometry args={[3, 2, 3]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-b.size[0] * 0.2, (b.size[1] / 2) + 3.5, -b.size[2] * 0.2]}>
              <cylinderGeometry args={[1.2, 1.2, 1.8, 12]} />
              <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Rooftop Antenna Spire & Blinking FAA Strobe */}
            <mesh position={[0, (b.size[1] / 2) + 6, 0]}>
              <cylinderGeometry args={[0.08, 0.4, 9, 8]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, (b.size[1] / 2) + 10.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <pointLight
              position={[0, (b.size[1] / 2) + 10.5, 0]}
              color="#ef4444"
              intensity={2.2}
              distance={35}
            />
          </group>
        ))}

        {/* Master Strobe on Top of Wallace Monolith */}
        <pointLight
          ref={strobeRef}
          position={[0, 78, -26]}
          color="#ef4444"
          distance={80}
        />

        {/* Rooftop Helipad on LAPD Tower [-18, 57, -14] */}
        <group position={[-18, 57, -14]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4.5, 5, 24]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 3]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>

        {/* ================= THE GIANT HOLOGRAPHIC JOI SILHOUETTE ================= */}
        {/* Blade Runner 2049 Iconic Hologram "You look like a good Joe" */}
        <group ref={joiRef} position={[0, 22, 10]}>
          {/* 3D Hologram Projection Plane */}
          {joiTex && (
            <mesh>
              <planeGeometry args={[14, 28]} />
              <meshBasicMaterial
                map={joiTex}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}
          {/* Hologram Pedestal / Emitter Rings */}
          <mesh position={[0, -14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 4.5, 32]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -13.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[2, 2.5, 1, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          {/* Giant Pink/Magenta Volumetric Spotlight illuminating the mist & streets */}
          <spotLight
            position={[0, 10, 0]}
            color="#ec4899"
            intensity={5.5}
            distance={55}
            angle={0.6}
            penumbra={0.7}
          />
        </group>

        {/* ================= WALLACE CORP AMBER BILLBOARD ================= */}
        <group position={[0, 26, -15]}>
          {wallaceTex && (
            <mesh>
              <planeGeometry args={[22, 11]} />
              <meshBasicMaterial
                ref={billboardRef}
                map={wallaceTex}
                transparent
                opacity={0.92}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {/* Heavy Steel Frame & Supports */}
          <mesh position={[0, 0, -0.3]}>
            <boxGeometry args={[22.6, 11.6, 0.4]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} />
          </mesh>
          <pointLight color="#f59e0b" intensity={3.0} distance={30} />
        </group>

        {/* Elevated Cyber Skybridges connecting towers */}
        <group position={[0, 22, 18]}>
          <mesh>
            <boxGeometry args={[26, 3.5, 3.5]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Glowing Cyan Glass Corridor */}
          <mesh position={[0, 0, 1.8]}>
            <planeGeometry args={[24, 2]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, 0, -1.8]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[24, 2]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
        </group>

        {/* Second Level Skybridge at y: 32 */}
        <group position={[-9, 32, -13]}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[18, 3, 3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} />
          </mesh>
        </group>
      </group>

      {/* ================= 4. OLD QUARTER (NOODLE STREET / BIBI'S BAR) ================= */}
      <group>
        {oldQuarterBuildings.map((b, i) => (
          <group key={`oq-${i}`} position={b.pos as [number, number, number]}>
            {/* Brick Building Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={b.size as [number, number, number]} />
              <meshStandardMaterial color={b.color} roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Glowing Neon Shopfront Sign */}
            <mesh position={[0, -b.size[1] * 0.3, (b.size[2] / 2) + 0.15]}>
              <boxGeometry args={[b.size[0] * 0.8, 1.4, 0.25]} />
              <meshBasicMaterial color={b.neon} />
            </mesh>
            <pointLight
              position={[0, -b.size[1] * 0.3, (b.size[2] / 2) + 1.2]}
              color={b.neon}
              intensity={2.0}
              distance={12}
            />

            {/* Exterior AC Compressor Units */}
            <mesh position={[b.size[0] * 0.3, 1, (b.size[2] / 2) + 0.4]}>
              <boxGeometry args={[1.2, 0.8, 0.6]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        ))}

        {/* WHITE DRAGON NOODLE BAR STALL [-46, 0, 16] */}
        <group position={[-46, 0, 16]}>
          {/* Curved Stall Counter */}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[6, 1.1, 2.5]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Round Barstools */}
          {[-2, 0, 2].map((bx, bi) => (
            <group key={`stool-${bi}`} position={[bx, 0, 1.8]}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.1, 16]} />
                <meshStandardMaterial color="#f43f5e" roughness={0.4} />
              </mesh>
            </group>
          ))}
          {/* Overhanging Striped Awning */}
          <mesh position={[0, 2.8, 0.4]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[7, 0.2, 3.8]} />
            <meshStandardMaterial color="#e11d48" roughness={0.6} />
          </mesh>
          {/* Noodle Bar Neon Signboard */}
          {noodleTex && (
            <mesh position={[0, 3.4, 1.8]}>
              <planeGeometry args={[5, 2.5]} />
              <meshBasicMaterial map={noodleTex} side={THREE.DoubleSide} />
            </mesh>
          )}
          <pointLight position={[0, 2.6, 0.5]} color="#f43f5e" intensity={2.5} distance={14} />
        </group>

        {/* Overhead Hanging Strings of Paper Lanterns */}
        {[-40, -46, -52, -58].map((lx, i) => (
          <group key={`lantern-${i}`} position={[lx, 4.5, 18]}>
            <mesh>
              <cylinderGeometry args={[0.35, 0.4, 0.9, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#f43f5e" : "#f59e0b"} />
            </mesh>
            <pointLight
              color={i % 2 === 0 ? "#f43f5e" : "#f59e0b"}
              intensity={1.8}
              distance={8}
            />
          </group>
        ))}

        {/* Overhead Power Cables Crisscrossing the Alley */}
        <mesh position={[-50, 6, 18]} rotation={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 28, 6]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-48, 5.5, 22]} rotation={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 26, 6]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* Tele-Booth (Phone Memory Location) */}
        <group position={[-52, 1.5, 12]}>
          <mesh>
            <boxGeometry args={[1.8, 3.2, 1.8]} />
            <meshStandardMaterial color="#0a0f1d" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.92]}>
            <planeGeometry args={[1.5, 2.8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 1.0, 0]} color="#38bdf8" intensity={2.2} distance={8} />
        </group>
      </group>

      {/* ================= 5. METRO DISTRICT (AUTOMATED TRANSIT HUB) ================= */}
      <group position={[-20, 0, -55]}>
        {/* Main Station Canopy */}
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[26, 0.8, 18]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Translucent Violet Glass Roof */}
        <mesh position={[0, 3.9, 0]}>
          <boxGeometry args={[24, 0.15, 16]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.45} />
        </mesh>
        {/* Entrance Pillars */}
        {[[-12, -8], [12, -8], [-12, 8], [12, 8]].map(([px, pz], i) => (
          <mesh key={`mpillar-${i}`} position={[px, 1.75, pz]}>
            <cylinderGeometry args={[0.35, 0.35, 3.5, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
        {/* Metro Destination Sign */}
        <mesh position={[0, 4.4, 9.1]}>
          <boxGeometry args={[14, 1.2, 0.3]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        {/* Departure Matrix Board */}
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[8, 1.8, 0.3]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Station Ambient Floodlight */}
        <pointLight position={[0, 3.0, 0]} color="#c084fc" intensity={3.0} distance={24} />
      </group>

      {/* ================= 6. RESIDENTIAL DISTRICT (K'S ESPERANZA TENEMENTS) ================= */}
      <group>
        {residentialBuildings.map((b, i) => (
          <group key={`res-b-${i}`} position={b.pos as [number, number, number]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={b.size as [number, number, number]} />
              <meshStandardMaterial color={b.color} roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Glowing Amber Window Matrix */}
            {winTex && (
              <mesh position={[0, 0, (b.size[2] / 2) + 0.05]}>
                <planeGeometry args={[b.size[0] * 0.88, b.size[1] * 0.88]} />
                <meshStandardMaterial
                  map={winTex}
                  emissive="#fbbf24"
                  emissiveMap={winTex}
                  emissiveIntensity={0.9}
                />
              </mesh>
            )}
          </group>
        ))}

        {/* Accessible Ground Residence Flat (CRT TV & Drawing Location) */}
        <group position={[45, 0, -39]}>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[12, 3.6, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.7} />
          </mesh>
          {/* Overhang Roof */}
          <mesh position={[0, 3.7, 0]}>
            <boxGeometry args={[13, 0.5, 13]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* Picture Window overlooking street */}
          <mesh position={[3, 1.8, 6.05]}>
            <planeGeometry args={[5, 2.4]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.35} />
          </mesh>
          {/* Warm Interior Lamp Light */}
          <pointLight position={[0, 2.2, 0]} color="#f59e0b" intensity={2.5} distance={14} />
        </group>
      </group>

      {/* ================= 7. INDUSTRIAL DISTRICT (WALLACE PROTEIN / COOLING) ================= */}
      <group>
        {industrialStructures.map((s, i) => (
          <group key={`ind-${i}`} position={s.pos as [number, number, number]}>
            {/* Hyperboloid Cooling Tower */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[s.rTop, s.rBot, s.h, 28]} />
              <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.4} />
            </mesh>
            {/* Glowing Hazard Safety Ring */}
            <mesh position={[0, s.h * 0.38, 0]}>
              <torusGeometry args={[s.rTop + 0.3, 0.2, 8, 28]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            <pointLight position={[0, s.h * 0.45, 0]} color="#f97316" intensity={2.8} distance={24} />
          </group>
        ))}

        {/* Billowing Industrial Steam Plumes */}
        <group ref={steamRef} position={[68, 0, 32]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={`steam-${i}`} position={[(i - 2) * 3.5, 12, 0]}>
              <sphereGeometry args={[1.8, 8, 8]} />
              <meshBasicMaterial color="#cbd5e1" transparent opacity={0.16} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ================= 8. WATERFRONT DISTRICT (THE LOS ANGELES SEA WALL) ================= */}
      <group position={[-50, 0, 70]}>
        {/* Dark Reflective Ocean Surface */}
        <mesh ref={oceanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 24]}>
          <planeGeometry args={[160, 100, 16, 16]} />
          <meshStandardMaterial
            color="#020817"
            roughness={0.03}
            metalness={0.95}
            envMapIntensity={2.2}
          />
        </mesh>

        {/* Monumental Sloped Concrete Sea Wall Barrier */}
        <mesh position={[0, 3, -15]} rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[95, 6, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.65} />
        </mesh>
        {/* Sea Wall Diagonal Support Buttresses */}
        {[-35, -15, 5, 25].map((bx, bi) => (
          <mesh key={`buttress-${bi}`} position={[bx, 2, -13]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[2.5, 5, 4]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
        ))}

        {/* Hazard Safety Stripe */}
        <mesh position={[0, 5.8, -13.1]}>
          <boxGeometry args={[92, 0.4, 0.1]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>

        {/* Boardwalk Pier with Guard Railings */}
        <mesh position={[4, 0.5, 6]}>
          <boxGeometry args={[10, 1.0, 38]} />
          <meshStandardMaterial color="#27272a" roughness={0.5} />
        </mesh>

        {/* Harbor Lighthouse Beacon Tower */}
        <group position={[-25, 0, 16]}>
          <mesh position={[0, 10, 0]}>
            <cylinderGeometry args={[1.2, 2.2, 20, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Sweeping Light Head */}
          <group ref={beaconRef} position={[0, 20.5, 0]}>
            <mesh>
              <sphereGeometry args={[1.0, 16, 16]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
            <spotLight
              position={[0, 0, 0]}
              angle={0.4}
              penumbra={0.6}
              intensity={6.0}
              color="#22d3ee"
              distance={80}
            />
          </group>
        </group>
      </group>

      {/* ================= 9. ROOFTOP GARDENS (HIGH-ALTITUDE SPIRE SANCTUARY) ================= */}
      <group position={[0, 32, 0]}>
        {/* Observatory Terrace Floor */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[20, 20, 0.9, 32]} />
          <meshStandardMaterial color="#064e3b" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Geodesic Translucent Canopy Dome */}
        <mesh position={[0, 7, 0]}>
          <sphereGeometry args={[19.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.18} wireframe side={THREE.DoubleSide} />
        </mesh>
        {/* Holographic Glowing Bonsai Trees */}
        {[[-7, 0, -7], [7, 0, -7], [-7, 0, 7], [7, 0, 7]].map(([tx, , tz], i) => (
          <group key={`bonsai-${i}`} position={[tx, 0.4, tz]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.2, 0.35, 2.4, 6]} />
              <meshStandardMaterial color="#022c22" />
            </mesh>
            <mesh position={[0, 2.6, 0]}>
              <dodecahedronGeometry args={[1.4]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
            </mesh>
            <pointLight position={[0, 2.6, 0]} color="#10b981" intensity={1.5} distance={10} />
          </group>
        ))}
        <pointLight position={[0, 6, 0]} color="#10b981" intensity={2.5} distance={30} />
      </group>

      {/* Elevator Express Pad at [0, 0, 0] to ride up to Rooftop Gardens */}
      <group position={[0, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.4, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
