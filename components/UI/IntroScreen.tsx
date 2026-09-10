"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";

export default function IntroScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] text-neutral-100 overflow-hidden">
      {/* Background subtle rain animation / mist texture */}
      <div className="absolute inset-0 cinematic-vignette" />
      <div className="absolute inset-0 scanlines opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl bg-black/50 p-8 rounded-xl border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Minimal system identifier */}
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-400 font-mono">
          {"// LOS ANGELES 2049 // ARCHIVE PROTOCOL"}
        </p>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.25em] my-3 text-white neon-glow-cyan">
          AFTER RAIN
        </h1>

        {/* Small subtitle */}
        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-amber-400 mb-6 font-mono neon-glow-amber">
          2049 • THE NEON METROPOLIS
        </p>

        {/* Tagline */}
        <div className="border-l-2 border-cyan-400/70 pl-4 my-2 text-left bg-cyan-950/20 py-2 pr-3 rounded-r">
          <p className="text-sm italic text-neutral-200 font-light tracking-wide leading-relaxed">
            &ldquo;All those moments will be lost in time, like tears in rain.&rdquo;
          </p>
        </div>

        <p className="text-xs text-neutral-300 font-mono tracking-wider max-w-md my-5 opacity-90 leading-relaxed">
          Rain pours ceaselessly over wet asphalt and towering neon monoliths. Spinners slice through the mist. Searchlights sweep across the skies. Explore the illuminated streets and piece together what remains.
        </p>

        {/* Minimal Enter City Button */}
        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: "rgba(56, 189, 248, 0.25)" }}
          whileTap={{ scale: 0.96 }}
          onClick={startGame}
          className="mt-4 px-10 py-3.5 border-2 border-cyan-400 bg-cyan-950/40 backdrop-blur-md text-cyan-300 tracking-[0.3em] font-mono text-sm uppercase transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:border-cyan-200 hover:text-white cursor-pointer rounded"
        >
          ENTER CITY
        </motion.button>

        {/* Controls hint */}
        <p className="text-[11px] font-mono text-neutral-400 mt-6 tracking-widest">
          WASD TO MOVE • MOUSE TO LOOK • E TO EXAMINE
        </p>
      </motion.div>
    </div>
  );
}
