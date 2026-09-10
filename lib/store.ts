import { create } from 'zustand';
import { DistrictId, GameState, MemoryItem, WeatherType, CityAnnouncement } from './types';
import { DISTRICTS, INITIAL_MEMORIES, CITY_ANNOUNCEMENTS } from './data';
import { sound } from './audio';

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
}));
