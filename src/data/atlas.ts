import { z } from "zod";

/**
 * All four sheets share one square canvas (3072×3072).
 * Pin x/y are fractions of that canvas, so camps, gathering nodes,
 * monster spawns, and weather tags can be added later without
 * re-aligning the art — as long as new sheets stay registered.
 */
export const LOCALE_ID = "ancient-forest";
export const CODEX_SCHEMA = 1;

export const LAYERS = [
  {
    id: "background",
    name: "Illustration",
    detail: "The field sketch under the charts",
    src: "/maps/background.webp",
    alt: "Ancient Forest illustrated background",
  },
  {
    id: "lower",
    name: "Lower level",
    detail: "Shore, forest floor, and caves",
    src: "/maps/lower.webp",
    alt: "Ancient Forest lower level map",
  },
  {
    id: "middle",
    name: "Middle level",
    detail: "Trunk roads and mid-canopy",
    src: "/maps/middle.webp",
    alt: "Ancient Forest middle level map",
  },
  {
    id: "upper",
    name: "Upper level",
    detail: "Crown, nest, and reservoir",
    src: "/maps/upper.webp",
    alt: "Ancient Forest upper level map",
  },
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];
export type OverlayId = Exclude<LayerId, "background">;

export const PIN_KINDS = [
  { id: "camp", name: "Camp", hint: "Base camps and bivouacs" },
  { id: "interactable", name: "Interactable", hint: "Gathering, tracks, endemic life" },
  { id: "monster", name: "Monster", hint: "Spawns and patrols" },
  { id: "weather", name: "Weather", hint: "Local conditions and hazards" },
] as const;

export type PinKind = (typeof PIN_KINDS)[number]["id"];

export const WEATHERS = [
  { id: "clear", name: "Clear" },
  { id: "rain", name: "Rain" },
  { id: "fog", name: "Fog" },
  { id: "night", name: "Night" },
] as const;

export type WeatherId = (typeof WEATHERS)[number]["id"];

export const AREAS = Array.from({ length: 17 }, (_, index) => index + 1);

export const MONSTER_SUGGESTIONS = [
  "Anjanath",
  "Fulgur Anjanath",
  "Great Jagras",
  "Kulu-Ya-Ku",
  "Pukei-Pukei",
  "Tobi-Kadachi",
  "Rathian",
  "Rathalos",
  "Azure Rathalos",
  "Bazelgeuse",
  "Deviljho",
  "Nargacuga",
  "Banbaro",
  "Zinogre",
  "Yian Garuga",
  "Aptonoth",
  "Jagras",
  "Kestodon",
  "Mernos",
  "Mosswine",
  "Vespoid",
  "Gajau",
  "Grimalkyne",
];

export type Pin = {
  id: string;
  kind: PinKind;
  name: string;
  note: string;
  x: number;
  y: number;
  level: OverlayId;
  area: number | null;
  /** Empty means the pin shows in every atmosphere. */
  weather: WeatherId[];
};

export const pinSchema = z.object({
  id: z.string().min(1).max(80),
  kind: z.enum(["camp", "interactable", "monster", "weather"]),
  name: z.string().max(80),
  note: z.string().max(500),
  x: z.number().gte(0).lte(1),
  y: z.number().gte(0).lte(1),
  level: z.enum(["lower", "middle", "upper"]),
  area: z.number().int().gte(1).lte(17).nullable(),
  weather: z.array(z.enum(["clear", "rain", "fog", "night"])).max(4),
});

export const codexFileSchema = z.object({
  schema: z.literal(CODEX_SCHEMA),
  locale: z.literal(LOCALE_ID),
  pins: z.array(pinSchema).max(400),
});

export type CodexFile = z.infer<typeof codexFileSchema>;

export function isPin(value: unknown): value is Pin {
  return pinSchema.safeParse(value).success;
}

export const LEVEL_SHORT: Record<OverlayId, string> = {
  lower: "Lower",
  middle: "Middle",
  upper: "Upper",
};
