"use client";

import { useGameStore } from "@/lib/store";
import { DISTRICTS, CHAPTERS } from "@/lib/data";

export default function HUD() {
  const currentDistrict = useGameStore((s) => s.currentDistrict);
  const chapter = useGameStore((s) => s.chapter);
  const memories = useGameStore((s) => s.memories);
  const nearbyMemory = useGameStore((s) => s.nearbyMemory);
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const setGameState = useGameStore((s) => s.setGameState);
  const activeAnnouncement = useGameStore((s) => s.activeAnnouncement);
  const openMemory = useGameStore((s) => s.openMemory);
  const weather = useGameStore((s) => s.weather);

  const districtData = DISTRICTS[currentDistrict] || DISTRICTS.central;
  const currentChapterData = CHAPTERS.find((c) => c.number === chapter) || CHAPTERS[0];
  const discoveredCount = memories.filter((m) => m.discovered).length;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-8 font-mono select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* District & Chapter Information */}
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md border border-neutral-800 p-3 max-w-sm rounded">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] text-cyan-400 font-semibold tracking-widest uppercase">
              {"//"} {districtData.name}
            </span>
          </div>
          <p className="text-xs text-neutral-300 font-sans tracking-wide">
            {districtData.tagline}
          </p>
          <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="text-amber-400/90 font-bold">
              CHAPTER 0{currentChapterData.number}: {currentChapterData.title}
            </span>
            <span className="text-neutral-500 uppercase">
              {weather === 'dawn' || chapter === 5 ? 'DAWN CLEARING' : 'HEAVY RAIN'}
            </span>
          </div>
        </div>

        {/* Top Right: Status, Audio & Navigation Modals */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Memories Counter */}
          <button
            onClick={() => setGameState("memories")}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded transition cursor-pointer"
          >
            <span className="text-cyan-400">◆</span>
            <span>MEMORIES: {discoveredCount}/9</span>
            <kbd className="text-[9px] px-1 bg-neutral-800 rounded text-neutral-400">I</kbd>
          </button>

          {/* Map Button */}
          <button
            onClick={() => setGameState("map")}
            className="px-3 py-1.5 bg-black/60 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <span>MAP</span>
            <kbd className="text-[9px] px-1 bg-neutral-800 rounded text-neutral-400">M</kbd>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleMute}
            className="px-2.5 py-1.5 bg-black/60 hover:bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded transition cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Center Screen: Reticle & Interactive Prompt */}
      <div className="flex flex-col items-center justify-center">
        {/* Subtle center crosshair */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 mb-3" />

        {/* Proximity Interaction Prompt */}
        {nearbyMemory && (
          <div
            onClick={() => openMemory(nearbyMemory)}
            className="pointer-events-auto animate-bounce bg-neutral-950/80 border border-cyan-400/80 text-cyan-300 px-4 py-2 rounded shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer flex items-center gap-2 text-xs tracking-wider"
          >
            <kbd className="px-1.5 py-0.5 bg-cyan-900/60 border border-cyan-400 rounded text-[11px] font-bold">
              E
            </kbd>
            <span>EXAMINE: {nearbyMemory.objectName.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Automated Announcement & Controls Helper */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-3">
        {/* City Broadcast Alert Ticker */}
        {activeAnnouncement ? (
          <div className="pointer-events-auto max-w-lg bg-neutral-950/90 border-l-2 border-amber-400 border border-neutral-800 p-3 text-xs rounded shadow-lg animate-glitch">
            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>⚠ AUTOMATED BROADCAST</span>
              <span className="text-neutral-500">{"//"} {activeAnnouncement.source}</span>
            </div>
            <p className="text-neutral-200 font-sans text-xs leading-relaxed">
              &ldquo;{activeAnnouncement.message}&rdquo;
            </p>
          </div>
        ) : (
          <div className="text-[10px] text-neutral-600 hidden md:block">
            {"// VESPER SENSOR ARRAY: NOMINAL // TRANSIT 100%"}
          </div>
        )}

        {/* Minimal Controls Guide */}
        <div className="text-[10px] text-neutral-400 bg-black/40 backdrop-blur-sm border border-neutral-800/80 px-3 py-1.5 rounded hidden sm:flex items-center gap-3">
          <span><b className="text-neutral-200">WASD</b> Move</span>
          <span>•</span>
          <span><b className="text-neutral-200">Mouse</b> Look</span>
          <span>•</span>
          <span><b className="text-neutral-200">E</b> Interact</span>
          <span>•</span>
          <span><b className="text-neutral-200">M</b> Map</span>
          <span>•</span>
          <span><b className="text-neutral-200">I</b> Memories</span>
        </div>
      </div>
    </div>
  );
}
