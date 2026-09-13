"use client";

import { useGameStore } from "@/lib/store";

export default function MaahiDialogueUI() {
  const npcDialogueOpen = useGameStore((s) => s.npcDialogueOpen);
  const npcQueue = useGameStore((s) => s.npcQueue);
  const npcLineIndex = useGameStore((s) => s.npcLineIndex);
  const nearbyNPC = useGameStore((s) => s.nearbyNPC);

  if (!npcDialogueOpen) {
    // Subtle "you can talk to her" hint when close but not yet talking.
if (nearbyNPC) {
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white text-3xl font-bold px-8 py-4 rounded">
      TEST — E TO TALK
    </div>
  );
}
    return null;
  }

  const currentLine = npcQueue[npcLineIndex];
  const isLastLine = npcLineIndex === npcQueue.length - 1;

  return (
    <div className="pointer-events-none fixed bottom-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-6">
      <div className="rounded-md border border-fuchsia-400/30 bg-black/70 backdrop-blur-sm px-6 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-400 font-mono mb-2">
          Maahi
        </p>
        <p className="text-base text-zinc-100 leading-relaxed font-mono">
          {currentLine}
        </p>
        <p className="text-xs text-zinc-500 mt-3 font-mono">
          {isLastLine ? "[E] Close" : "[E] Continue"}
        </p>
      </div>
    </div>
  );
}
