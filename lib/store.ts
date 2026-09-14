import { create } from 'zustand';
import { DistrictId, GameState, MemoryItem, WeatherType, CityAnnouncement } from './types';
import { DISTRICTS, INITIAL_MEMORIES, CITY_ANNOUNCEMENTS } from './data';
import { sound } from './audio';

// --- Maahi's dialogue content -----------------------------------------------
// PLACEHOLDER LINES — replace these with the real dialogue whenever you have it.
// Each conversation is an array of lines shown one at a time (press E to advance).
// "Lore" conversations hint at the world/story; "casual" ones are just chit-chat.
// A conversation is picked at random each time you approach her fresh.

const MAAHI_LORE_CONVERSATIONS: string[][] = [
  [
    " You keep coming back to this street. Do you even know why?",
    "Some of us remember things the city would rather we forgot.",
    "We can survive the storm of sadness but the waves of happiness needs a shore to come back",
    "Everything will be good in the end if it’s not good then it’s not the end",
  ],
  [
    "The rain here isn't just weather. Nothing about this city is 'just' anything.",
  ],
];

const MAAHI_CASUAL_CONVERSATIONS: string[][] = [
  ["Cold night, isn't it? Stay dry out there."],
  [
    "Oh, you again. Small world. Or small district, at least.",
    "Don't let the neon fool you — it's colder than it looks.",
  ],
];

const MAAHI_LORE_CHANCE = 0.45; // ~45% of conversations lean mysterious/lore

interface GameStore {
  gameState: GameState;
  currentDistrict: DistrictId;
  discoveredDistricts: DistrictId[];
  memories: MemoryItem[];
  activeMemory: MemoryItem | null;
  nearbyMemory: MemoryItem | null;
  chapter: number;
  weather: WeatherType;
  isMuted: boolean;
  playerPos: [number, number, number];
  activeAnnouncement: CityAnnouncement | null;
  thunderFlash: boolean;

  // --- Cats ---
  nearbyCat: string | null;
  pettedCats: string[];
  catPetCount: Record<string, number>;

  // --- Maahi (NPC) ---
  nearbyNPC: boolean;
  npcDialogueOpen: boolean;
  npcQueue: string[];
  npcLineIndex: number;

  // Actions
  startGame: () => void;
  setGameState: (state: GameState) => void;
  setCurrentDistrict: (id: DistrictId) => void;
  setPlayerPos: (pos: [number, number, number]) => void;
  setNearbyMemory: (mem: MemoryItem | null) => void;
  openMemory: (mem: MemoryItem) => void;
  closeMemory: () => void;
  toggleMute: () => void;
  triggerThunder: () => void;
  setWeather: (w: WeatherType) => void;
  setChapter: (c: number) => void;
  fastTravel: (id: DistrictId) => void;
  triggerAnnouncement: (ann?: CityAnnouncement) => void;

  // --- Cats ---
  setNearbyCat: (id: string | null) => void;
  petCat: (id: string) => void;

  // --- Maahi (NPC) ---
  setNearbyNPC: (near: boolean) => void;
  talkToMaahi: () => void; // starts a conversation, or advances it if already open
  closeMaahiDialogue: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'intro',
  currentDistrict: 'central',
  discoveredDistricts: ['central'],
  memories: INITIAL_MEMORIES,
  activeMemory: null,
  nearbyMemory: null,
  chapter: 1,
  weather: 'heavy_rain',
  isMuted: false,
  playerPos: [0, 1.6, 12],
  activeAnnouncement: null,
  thunderFlash: false,

  nearbyCat: null,
  pettedCats: [],
  catPetCount: {},

  nearbyNPC: false,
  npcDialogueOpen: false,
  npcQueue: [],
  npcLineIndex: 0,

  startGame: () => {
    sound.init();
    sound.resume();
    set({ gameState: 'playing' });
  },

  setGameState: (state) => {
    set({ gameState: state });
    if (state === 'playing') {
      sound.resume();
    }
  },

  setCurrentDistrict: (id) => {
    const { discoveredDistricts, currentDistrict } = get();
    if (currentDistrict !== id) {
      const updated = discoveredDistricts.includes(id)
        ? discoveredDistricts
        : [...discoveredDistricts, id];
      set({ currentDistrict: id, discoveredDistricts: updated });
    }
  },

  setPlayerPos: (pos) => {
    set({ playerPos: pos });
  },

  setNearbyMemory: (mem) => {
    set({ nearbyMemory: mem });
  },

  openMemory: (mem) => {
    sound.playMemoryChime();
    const updatedMemories = get().memories.map((m) =>
      m.id === mem.id ? { ...m, discovered: true } : m
    );

    const discoveredCount = updatedMemories.filter((m) => m.discovered).length;
    let newChapter = get().chapter;

    if (discoveredCount >= 2 && newChapter < 2) newChapter = 2;
    if (discoveredCount >= 4 && newChapter < 3) newChapter = 3;
    if (discoveredCount >= 6 && newChapter < 4) newChapter = 4;
    if (mem.id === 'mem_terminal' || discoveredCount >= 8) {
      newChapter = 5;
    }

    set({
      activeMemory: { ...mem, discovered: true },
      memories: updatedMemories,
      gameState: 'inspecting',
      chapter: newChapter,
      weather: newChapter === 5 ? 'clearing' : get().weather,
    });
  },

  closeMemory: () => {
    const { chapter } = get();
    if (chapter === 5) {
      set({ gameState: 'ending', activeMemory: null });
    } else {
      set({ gameState: 'playing', activeMemory: null });
    }
  },

  toggleMute: () => {
    const muted = sound.toggleMute();
    set({ isMuted: muted });
  },

  triggerThunder: () => {
    sound.playThunder();
    set({ thunderFlash: true });
    setTimeout(() => {
      set({ thunderFlash: false });
    }, 280);
  },

  setWeather: (w) => set({ weather: w }),
  setChapter: (c) => set({ chapter: c }),

  fastTravel: (id) => {
    const d = DISTRICTS[id];
    if (d) {
      set({
        playerPos: [d.center[0], 1.6, d.center[2] + 4],
        currentDistrict: id,
        gameState: 'playing',
      });
    }
  },

  triggerAnnouncement: (ann) => {
    const choice = ann || CITY_ANNOUNCEMENTS[Math.floor(Math.random() * CITY_ANNOUNCEMENTS.length)];
    sound.playAnnouncementChime();
    set({ activeAnnouncement: choice });
    setTimeout(() => {
      set({ activeAnnouncement: null });
    }, 9000);
  },

  // --- Cats ---
  setNearbyCat: (id) => {
    set({ nearbyCat: id });
  },

  petCat: (id) => {
    set((state) => {
      const alreadyPetted = state.pettedCats.includes(id);
      return {
        pettedCats: alreadyPetted ? state.pettedCats : [...state.pettedCats, id],
        catPetCount: { ...state.catPetCount, [id]: (state.catPetCount[id] || 0) + 1 },
      };
    });
  },

  // --- Maahi (NPC) ---
  setNearbyNPC: (near) => {
    set({ nearbyNPC: near });
  },

  talkToMaahi: () => {
    const { npcDialogueOpen, npcQueue, npcLineIndex } = get();

    if (!npcDialogueOpen) {
      // Fresh conversation: randomly pick lore or casual, then a random
      // conversation from that pool.
      const isLore = Math.random() < MAAHI_LORE_CHANCE;
      const pool = isLore ? MAAHI_LORE_CONVERSATIONS : MAAHI_CASUAL_CONVERSATIONS;
      const chosen = pool[Math.floor(Math.random() * pool.length)];

      set({
        npcDialogueOpen: true,
        npcQueue: chosen,
        npcLineIndex: 0,
      });
      return;
    }

    // Already talking: advance to next line, or close if that was the last one.
    if (npcLineIndex < npcQueue.length - 1) {
      set({ npcLineIndex: npcLineIndex + 1 });
    } else {
      set({ npcDialogueOpen: false, npcQueue: [], npcLineIndex: 0 });
    }
  },

  closeMaahiDialogue: () => {
    set({ npcDialogueOpen: false, npcQueue: [], npcLineIndex: 0 });
  },
}));
