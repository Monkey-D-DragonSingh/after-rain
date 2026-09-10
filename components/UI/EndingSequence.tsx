"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store";

export default function EndingSequence() {
  const setGameState = useGameStore((s) => s.setGameState);
  const setWeather = useGameStore((s) => s.setWeather);

  const handleContinueWalking = () => {
    setWeather("dawn");
    setGameState("playing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 text-white font-mono p-6">
      <div className="absolute inset-0 cinematic-vignette pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 3.0, ease: "easeOut" }}
        className="relative z-10 max-w-xl text-center space-y-8"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">
          {"// CHAPTER 05 // TRANSLATION REVELATION"}
        </p>

        <div className="space-y-4 font-sans font-light text-neutral-300 text-sm md:text-base leading-relaxed">
          <p>
            The telemetry is clear now. No catastrophe extinguished the voices of Vesper.
          </p>
          <p>
            When the sky opened its eye, the citizens stepped voluntarily into the silence above the clouds.
            They left their mugs warm, their cakes prepared, their umbrellas beside dry shoes.
          </p>
          <p>
            They didn&apos;t run. They simply ascended.
          </p>
        </div>

        <div className="pt-6 border-t border-neutral-800/80 space-y-3">
          <p className="text-lg md:text-xl font-light italic text-amber-200 tracking-wide font-sans">
            &ldquo;The city never stopped waiting.&rdquo;
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.3em] text-white pt-4 neon-glow-amber">
            AFTER RAIN
          </h1>
        </div>

        <div className="pt-8">
          <button
            onClick={handleContinueWalking}
            className="px-8 py-3 border border-amber-500/50 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 tracking-[0.2em] text-xs uppercase rounded transition cursor-pointer"
          >
            WALK IN THE MORNING LIGHT
          </button>
        </div>
      </motion.div>
    </div>
  );
}
