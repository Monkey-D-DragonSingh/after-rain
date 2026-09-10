"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { MemoryItem } from "@/lib/types";

export default function MemoryModal() {
  const memories = useGameStore((s) => s.memories);
  const activeMemory = useGameStore((s) => s.activeMemory);
  const openMemory = useGameStore((s) => s.openMemory);
  const closeMemory = useGameStore((s) => s.closeMemory);

  // Selected memory inside modal, defaulting to activeMemory or first discovered memory
  const selectedItem: MemoryItem =
    activeMemory || memories.find((m) => m.discovered) || memories[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-5xl h-[85vh] bg-[#07090e] border border-neutral-800 rounded-lg flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Left Column: Index of All Memories */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800/80 bg-[#05060a] flex flex-col">
          <div className="p-4 border-b border-neutral-800/80">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-semibold flex items-center gap-2">
              <span>◆</span> MEMORY ARCHIVE
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              RECONSTRUCTED ARTIFACTS OF VESPER
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {memories.map((mem) => {
              const isSelected = selectedItem.id === mem.id;
              return (
                <button
                  key={mem.id}
                  onClick={() => mem.discovered && openMemory(mem)}
                  disabled={!mem.discovered}
                  className={`w-full text-left p-3 rounded text-xs transition flex flex-col gap-1 border ${
                    isSelected
                      ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                      : mem.discovered
                      ? "bg-neutral-900/30 border-neutral-800/60 text-neutral-300 hover:bg-neutral-800/50"
                      : "bg-black/20 border-transparent text-neutral-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold">{mem.memoryCode}</span>
                    <span className="text-neutral-500">{mem.discovered ? mem.timestamp : "--:--:--"}</span>
                  </div>
                  <div className="font-sans text-xs font-medium truncate">
                    {mem.discovered ? mem.title : "[ ENCRYPTED SIGNAL ]"}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {mem.discovered ? mem.districtName : "SECTOR UNDISCOVERED"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Forensic Examination View */}
        <div className="flex-1 flex flex-col justify-between p-6 md:p-8 overflow-y-auto bg-[#080a11]">
          {selectedItem.discovered ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-neutral-800/80 pb-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span className="text-cyan-400 font-bold tracking-widest">{selectedItem.memoryCode}</span>
                  <span className="text-amber-400 font-mono">TIMESTAMP: {selectedItem.timestamp}</span>
                </div>
                <h1 className="text-2xl font-light text-white tracking-wide font-sans mb-1">
                  {selectedItem.title}
                </h1>
                <p className="text-xs text-neutral-400">
                  OBJECT: <span className="text-neutral-200 font-semibold">{selectedItem.objectName}</span> • LOCATION: <span className="text-neutral-200">{selectedItem.locationSpecific}</span>
                </p>
              </div>

              {/* Visual Fragment Preview Box */}
              <div className="w-full h-44 bg-gradient-to-br from-neutral-950 to-cyan-950/30 border border-neutral-800 rounded relative flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
                <div className="text-center relative z-10">
                  <div className="w-10 h-10 mx-auto rounded-full border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2">
                    ◎
                  </div>
                  <p className="text-xs text-cyan-200/80 italic font-sans max-w-md">
                    &ldquo;{selectedItem.visualPrompt}&rdquo;
                  </p>
                </div>
              </div>

              {/* Observation & Context */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  {"// ENVIRONMENTAL CONTEXT"}
                </h3>
                <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed bg-black/30 p-3.5 border border-neutral-800/60 rounded">
                  {selectedItem.shortContext}
                </p>
              </div>

              {/* Forensic Evidence Points */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  {"// EVIDENCE LOGS"}
                </h3>
                <ul className="space-y-1.5">
                  {selectedItem.evidenceText.map((line, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-neutral-400 font-sans flex items-start gap-2 pl-1"
                    >
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500">
              <div className="text-3xl mb-3">⬚</div>
              <p className="text-sm font-sans text-neutral-400">ARTIFACT NOT YET DISCOVERED</p>
              <p className="text-xs text-neutral-600 mt-1 max-w-sm">
                Explore the streets of Vesper City to locate physical remnants left behind by the inhabitants.
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-neutral-800/80 flex justify-between items-center">
            <div className="text-[11px] text-neutral-500">
              PRESS <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded">ESC</kbd> TO RETURN
            </div>
            <button
              onClick={closeMemory}
              className="px-6 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs tracking-wider rounded transition cursor-pointer"
            >
              CLOSE ARCHIVE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
