"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { DISTRICTS } from "@/lib/data";
import { DistrictId } from "@/lib/types";

export default function MapModal() {
  const currentDistrict = useGameStore((s) => s.currentDistrict);
  const discoveredDistricts = useGameStore((s) => s.discoveredDistricts);
  const memories = useGameStore((s) => s.memories);
  const playerPos = useGameStore((s) => s.playerPos);
  const fastTravel = useGameStore((s) => s.fastTravel);
  const setGameState = useGameStore((s) => s.setGameState);

  const districtList = Object.values(DISTRICTS);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-10 bg-black/85 backdrop-blur-xl font-mono">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[85vh] bg-[#07090f] border border-neutral-800 rounded-lg flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.85)]"
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#05060b]">
          <div>
            <h2 className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold flex items-center gap-2">
              <span>⌖</span> VESPER METROPOLITAN CARTOGRAPHY
            </h2>
            <p className="text-[11px] text-neutral-500">
              EXPLORATION RECORD • SECTORS DISCOVERED: {discoveredDistricts.length}/7
            </p>
          </div>
          <button
            onClick={() => setGameState("playing")}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 rounded cursor-pointer"
          >
            RESUME EXPLORATION (ESC)
          </button>
        </div>

        {/* Main Interactive Map Canvas / Grid */}
        <div className="flex-1 relative bg-[#030408] p-6 overflow-hidden flex items-center justify-center">
          {/* Background Vector Grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none"
               style={{
                 backgroundImage: "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
                 backgroundSize: "40px 40px"
               }}
          />

          {/* Central Compass Rose */}
          <div className="absolute top-6 left-6 text-[10px] text-neutral-500 border border-neutral-800 p-2 rounded bg-black/40">
            <div>LAT 34.0522° N</div>
            <div>LON 118.2437° W</div>
            <div className="text-cyan-400 mt-1">COORD: [{Math.round(playerPos[0])}, {Math.round(playerPos[2])}]</div>
          </div>

          {/* Metro Elevated Line Graphic */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <polyline
              points="280,320 480,240 680,360"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>

          {/* District Interactive Nodes */}
          <div className="relative w-full max-w-2xl h-full flex flex-wrap items-center justify-center gap-6 z-10">
            {districtList.map((d) => {
              const isDiscovered = discoveredDistricts.includes(d.id);
              const isCurrent = currentDistrict === d.id;
              const sectorMemories = memories.filter((m) => m.district === d.id);
              const discoveredSectorMemories = sectorMemories.filter((m) => m.discovered).length;

              return (
                <div
                  key={d.id}
                  className={`w-64 p-4 rounded border transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                      : isDiscovered
                      ? "bg-neutral-900/40 border-neutral-700/80 hover:border-neutral-500"
                      : "bg-black/40 border-neutral-900 opacity-40"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start text-[10px] mb-1">
                      <span className="text-neutral-500 uppercase">{d.id}</span>
                      {isCurrent && (
                        <span className="text-cyan-400 font-bold px-1.5 py-0.5 bg-cyan-950 rounded">
                          CURRENT LOCATION
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white tracking-wider">
                      {isDiscovered ? d.name : "[ UNEXPLORED SECTOR ]"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-sans mt-1 line-clamp-2">
                      {isDiscovered ? d.description : "Venture closer to illuminate this sector on the map."}
                    </p>
                  </div>

                  {/* Discoveries and Transit Action */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex justify-between items-center text-[10px]">
                    <span className="text-neutral-500">
                      {isDiscovered ? `MEMORIES: ${discoveredSectorMemories}/${sectorMemories.length}` : "---"}
                    </span>
                    {isDiscovered && !isCurrent && (
                      <button
                        onClick={() => fastTravel(d.id as DistrictId)}
                        className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded transition cursor-pointer"
                      >
                        TRANSIT HERE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-neutral-800 bg-[#05060b] flex justify-between text-[11px] text-neutral-400 px-6">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Current Sector
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Automated Maglev Rail
            </span>
          </div>
          <div>USE TRANSIT BUTTONS TO TRAVEL VIA ELEVATED TRAIN NETWORK</div>
        </div>
      </motion.div>
    </div>
  );
}
