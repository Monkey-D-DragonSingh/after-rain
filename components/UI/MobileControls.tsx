"use client";

import { useGameStore } from "@/lib/store";

export default function MobileControls() {
  const gameState = useGameStore((s) => s.gameState);
  const nearbyMemory = useGameStore((s) => s.nearbyMemory);
  const openMemory = useGameStore((s) => s.openMemory);

  if (gameState !== "playing") return null;

  const simulateKey = (code: string, pressed: boolean) => {
    window.dispatchEvent(
      new KeyboardEvent(pressed ? "keydown" : "keyup", { code, bubbles: true })
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-end p-4 md:hidden">
      <div className="flex justify-between items-end">
        {/* Virtual D-pad for touch devices */}
        <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-neutral-800">
          <div />
          <button
            onTouchStart={() => simulateKey("KeyW", true)}
            onTouchEnd={() => simulateKey("KeyW", false)}
            className="w-12 h-12 bg-neutral-900 active:bg-cyan-900/60 rounded flex items-center justify-center text-neutral-200 text-lg border border-neutral-700 select-none"
          >
            ▲
          </button>
          <div />

          <button
            onTouchStart={() => simulateKey("KeyA", true)}
            onTouchEnd={() => simulateKey("KeyA", false)}
            className="w-12 h-12 bg-neutral-900 active:bg-cyan-900/60 rounded flex items-center justify-center text-neutral-200 text-lg border border-neutral-700 select-none"
          >
            ◀
          </button>
          <button
            onTouchStart={() => simulateKey("KeyS", true)}
            onTouchEnd={() => simulateKey("KeyS", false)}
            className="w-12 h-12 bg-neutral-900 active:bg-cyan-900/60 rounded flex items-center justify-center text-neutral-200 text-lg border border-neutral-700 select-none"
          >
            ▼
          </button>
          <button
            onTouchStart={() => simulateKey("KeyD", true)}
            onTouchEnd={() => simulateKey("KeyD", false)}
            className="w-12 h-12 bg-neutral-900 active:bg-cyan-900/60 rounded flex items-center justify-center text-neutral-200 text-lg border border-neutral-700 select-none"
          >
            ▶
          </button>
        </div>

        {/* Action Button */}
        {nearbyMemory && (
          <button
            onClick={() => openMemory(nearbyMemory)}
            className="pointer-events-auto w-16 h-16 rounded-full bg-cyan-600/80 active:bg-cyan-400 text-white font-mono text-sm font-bold border-2 border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center cursor-pointer select-none"
          >
            EXAMINE
          </button>
        )}
      </div>
    </div>
  );
}
