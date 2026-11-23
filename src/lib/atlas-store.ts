import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  isPin,
  LAYERS,
  PIN_KINDS,
  type LayerId,
  type OverlayId,
  type Pin,
  type PinKind,
  type WeatherId,
} from "@/data/atlas";

type LayerSetting = { visible: boolean; opacity: number };

export type AtlasState = {
  layers: Record<LayerId, LayerSetting>;
  pins: Pin[];
  visibleKinds: Record<PinKind, boolean>;
  weather: WeatherId;
  filterByWeather: boolean;
  areaFilter: number | null;
  selectedId: string | null;
  placing: boolean;
  justCreatedId: string | null;
  setLayerVisible: (id: LayerId, visible: boolean) => void;
  setLayerOpacity: (id: LayerId, opacity: number) => void;
  soloLayer: (id: LayerId) => void;
  toggleKind: (kind: PinKind) => void;
  setWeather: (weather: WeatherId) => void;
  setFilterByWeather: (value: boolean) => void;
  setAreaFilter: (area: number | null) => void;
  setPlacing: (value: boolean) => void;
  select: (id: string | null) => void;
  addPin: (pin: Omit<Pin, "id">) => string;
  updatePin: (id: string, patch: Partial<Omit<Pin, "id">>) => void;
  removePin: (id: string) => void;
  replacePins: (pins: Pin[]) => void;
};

function defaultLayers(): Record<LayerId, LayerSetting> {
  return {
    background: { visible: true, opacity: 1 },
    lower: { visible: true, opacity: 1 },
    middle: { visible: true, opacity: 1 },
    upper: { visible: true, opacity: 1 },
  };
}

function defaultKinds(): Record<PinKind, boolean> {
  return { camp: true, interactable: true, monster: true, weather: true };
}

const layerIds = new Set(LAYERS.map((layer) => layer.id));
const kindIds = new Set(PIN_KINDS.map((kind) => kind.id));

export const useAtlas = create<AtlasState>()(
  persist(
    (set) => ({
      layers: defaultLayers(),
      pins: [],
      visibleKinds: defaultKinds(),
      weather: "clear",
      filterByWeather: false,
      areaFilter: null,
      selectedId: null,
      placing: false,
      justCreatedId: null,
      setLayerVisible: (id, visible) =>
        set((state) => ({
          layers: { ...state.layers, [id]: { ...state.layers[id], visible } },
        })),
      setLayerOpacity: (id, opacity) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [id]: { ...state.layers[id], opacity: Math.min(1, Math.max(0.15, opacity)) },
          },
        })),
      soloLayer: (id) =>
        set((state) => {
          const next = { ...state.layers };
          for (const layer of LAYERS) {
            const show = layer.id === "background" || layer.id === id;
            next[layer.id] = { ...next[layer.id], visible: show };
          }
          return { layers: next };
        }),
      toggleKind: (kind) =>
        set((state) => ({
          visibleKinds: { ...state.visibleKinds, [kind]: !state.visibleKinds[kind] },
        })),
      setWeather: (weather) => set({ weather }),
      setFilterByWeather: (filterByWeather) => set({ filterByWeather }),
      setAreaFilter: (areaFilter) => set({ areaFilter }),
      setPlacing: (placing) => set({ placing }),
      select: (selectedId) => set({ selectedId, justCreatedId: null }),
      addPin: (pin) => {
        const id = crypto.randomUUID();
        set((state) => ({
          pins: [...state.pins, { ...pin, id }],
          selectedId: id,
          placing: false,
          justCreatedId: id,
        }));
        return id;
      },
      updatePin: (id, patch) =>
        set((state) => ({
          pins: state.pins.map((pin) => (pin.id === id ? { ...pin, ...patch, id } : pin)),
        })),
      removePin: (id) =>
        set((state) => ({
          pins: state.pins.filter((pin) => pin.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),
      replacePins: (pins) => set({ pins, selectedId: null, justCreatedId: null }),
    }),
    {
      name: "ancient-forest-atlas",
      version: 1,
      skipHydration: true,
      partialize: (state) => ({
        layers: state.layers,
        pins: state.pins,
        visibleKinds: state.visibleKinds,
        weather: state.weather,
        filterByWeather: state.filterByWeather,
        areaFilter: state.areaFilter,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const saved = persisted as Partial<AtlasState>;
        const layers = defaultLayers();
        if (saved.layers) {
          for (const id of layerIds) {
            const entry = saved.layers[id as LayerId];
            if (!entry || typeof entry.opacity !== "number") continue;
            layers[id as LayerId] = {
              visible: entry.visible !== false,
              opacity: Math.min(1, Math.max(0.15, entry.opacity)),
            };
          }
        }
        const visibleKinds = defaultKinds();
        if (saved.visibleKinds) {
          for (const id of kindIds) {
            if (typeof saved.visibleKinds[id as PinKind] === "boolean") {
              visibleKinds[id as PinKind] = saved.visibleKinds[id as PinKind];
            }
          }
        }
        const pins = Array.isArray(saved.pins) ? saved.pins.filter(isPin) : [];
        const weather = saved.weather;
        const safeWeather: WeatherId =
          weather === "clear" || weather === "rain" || weather === "fog" || weather === "night"
            ? weather
            : "clear";
        const areaFilter =
          typeof saved.areaFilter === "number" && saved.areaFilter >= 1 && saved.areaFilter <= 17
            ? saved.areaFilter
            : null;
        return {
          ...current,
          layers,
          pins,
          visibleKinds,
          weather: safeWeather,
          filterByWeather: saved.filterByWeather === true,
          areaFilter,
        };
      },
    },
  ),
);

const LEVEL_BOUNDS: Record<OverlayId, { x0: number; y0: number; x1: number; y1: number }> = {
  lower: { x0: 0.15, y0: 0.16, x1: 0.95, y1: 0.99 },
  middle: { x0: 0.35, y0: 0.28, x1: 0.75, y1: 0.6 },
  upper: { x0: 0.49, y0: 0.2, x1: 0.81, y1: 0.55 },
};

/** Prefer the topmost visible sheet under the click, so a pin lands on the parchment you actually hit. */
export function levelAt(x: number, y: number, layers: Record<LayerId, LayerSetting>): OverlayId {
  const order: OverlayId[] = ["upper", "middle", "lower"];
  for (const id of order) {
    if (!layers[id].visible) continue;
    const box = LEVEL_BOUNDS[id];
    if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) return id;
  }
  if (layers.lower.visible) return "lower";
  if (layers.middle.visible) return "middle";
  return "upper";
}

export function pinShown(
  pin: Pin,
  state: Pick<AtlasState, "layers" | "visibleKinds" | "weather" | "filterByWeather" | "areaFilter">,
): boolean {
  if (!state.visibleKinds[pin.kind]) return false;
  if (!state.layers[pin.level].visible) return false;
  if (state.areaFilter !== null && pin.area !== state.areaFilter) return false;
  if (state.filterByWeather && pin.weather.length > 0 && !pin.weather.includes(state.weather)) return false;
  return true;
}
