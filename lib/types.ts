export type DistrictId =
  | 'central'
  | 'old_quarter'
  | 'metro'
  | 'residential'
  | 'industrial'
  | 'waterfront'
  | 'rooftop';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  tagline: string;
  description: string;
  center: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  ambientColor: string;
  fogDensity: number;
}

export type MemoryObjectType =
  | 'drawing'
  | 'coffee'
  | 'tv'
  | 'phone'
  | 'watch'
  | 'umbrella'
  | 'ticket'
  | 'cake'
  | 'terminal';

export interface MemoryItem {
  id: string;
  memoryCode: string; // e.g. "MEMORY 017"
  title: string;
  objectType: MemoryObjectType;
  district: DistrictId;
  districtName: string;
  locationSpecific: string;
  timestamp: string;
  position: [number, number, number];
  objectName: string;
  shortContext: string;
  evidenceText: string[];
  visualPrompt: string;
  discovered: boolean;
  audioVoice?: string;
}

export type GameState =
  | 'intro'
  | 'playing'
  | 'inspecting'
  | 'map'
  | 'memories'
  | 'ending'
  | 'paused';

export type WeatherType = 'heavy_rain' | 'mist' | 'thunder' | 'clearing' | 'dawn';

export interface CityAnnouncement {
  id: string;
  time: string;
  message: string;
  source: string;
}
