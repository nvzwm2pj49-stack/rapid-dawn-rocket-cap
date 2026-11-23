import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minus, c as Eye, i as Plus, l as EyeOff, o as MapPin, r as Trash2, s as LocateFixed, t as Upload, u as Download } from "../_libs/lucide-react.mjs";
import { a as object, i as number, n as array, o as string, r as literal, t as _enum } from "../_libs/zod.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BIacPV7-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* All four sheets share one square canvas (3072×3072).
* Pin x/y are fractions of that canvas, so camps, gathering nodes,
* monster spawns, and weather tags can be added later without
* re-aligning the art — as long as new sheets stay registered.
*/
var LOCALE_ID = "ancient-forest";
var LAYERS = [
	{
		id: "background",
		name: "Illustration",
		detail: "The field sketch under the charts",
		src: "/maps/background.webp",
		alt: "Ancient Forest illustrated background"
	},
	{
		id: "lower",
		name: "Lower level",
		detail: "Shore, forest floor, and caves",
		src: "/maps/lower.webp",
		alt: "Ancient Forest lower level map"
	},
	{
		id: "middle",
		name: "Middle level",
		detail: "Trunk roads and mid-canopy",
		src: "/maps/middle.webp",
		alt: "Ancient Forest middle level map"
	},
	{
		id: "upper",
		name: "Upper level",
		detail: "Crown, nest, and reservoir",
		src: "/maps/upper.webp",
		alt: "Ancient Forest upper level map"
	}
];
var PIN_KINDS = [
	{
		id: "camp",
		name: "Camp",
		hint: "Base camps and bivouacs"
	},
	{
		id: "interactable",
		name: "Interactable",
		hint: "Gathering, tracks, endemic life"
	},
	{
		id: "monster",
		name: "Monster",
		hint: "Spawns and patrols"
	},
	{
		id: "weather",
		name: "Weather",
		hint: "Local conditions and hazards"
	}
];
var WEATHERS = [
	{
		id: "clear",
		name: "Clear"
	},
	{
		id: "rain",
		name: "Rain"
	},
	{
		id: "fog",
		name: "Fog"
	},
	{
		id: "night",
		name: "Night"
	}
];
var AREAS = Array.from({ length: 17 }, (_, index) => index + 1);
var MONSTER_SUGGESTIONS = [
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
	"Grimalkyne"
];
var pinSchema = object({
	id: string().min(1).max(80),
	kind: _enum([
		"camp",
		"interactable",
		"monster",
		"weather"
	]),
	name: string().max(80),
	note: string().max(500),
	x: number().gte(0).lte(1),
	y: number().gte(0).lte(1),
	level: _enum([
		"lower",
		"middle",
		"upper"
	]),
	area: number().int().gte(1).lte(17).nullable(),
	weather: array(_enum([
		"clear",
		"rain",
		"fog",
		"night"
	])).max(4)
});
var codexFileSchema = object({
	schema: literal(1),
	locale: literal(LOCALE_ID),
	pins: array(pinSchema).max(400)
});
function isPin(value) {
	return pinSchema.safeParse(value).success;
}
var LEVEL_SHORT = {
	lower: "Lower",
	middle: "Middle",
	upper: "Upper"
};
function defaultLayers() {
	return {
		background: {
			visible: true,
			opacity: 1
		},
		lower: {
			visible: true,
			opacity: 1
		},
		middle: {
			visible: true,
			opacity: 1
		},
		upper: {
			visible: true,
			opacity: 1
		}
	};
}
function defaultKinds() {
	return {
		camp: true,
		interactable: true,
		monster: true,
		weather: true
	};
}
var layerIds = new Set(LAYERS.map((layer) => layer.id));
var kindIds = new Set(PIN_KINDS.map((kind) => kind.id));
var useAtlas = create()(persist((set) => ({
	layers: defaultLayers(),
	pins: [],
	visibleKinds: defaultKinds(),
	weather: "clear",
	filterByWeather: false,
	areaFilter: null,
	selectedId: null,
	placing: false,
	justCreatedId: null,
	setLayerVisible: (id, visible) => set((state) => ({ layers: {
		...state.layers,
		[id]: {
			...state.layers[id],
			visible
		}
	} })),
	setLayerOpacity: (id, opacity) => set((state) => ({ layers: {
		...state.layers,
		[id]: {
			...state.layers[id],
			opacity: Math.min(1, Math.max(.15, opacity))
		}
	} })),
	soloLayer: (id) => set((state) => {
		const next = { ...state.layers };
		for (const layer of LAYERS) {
			const show = layer.id === "background" || layer.id === id;
			next[layer.id] = {
				...next[layer.id],
				visible: show
			};
		}
		return { layers: next };
	}),
	toggleKind: (kind) => set((state) => ({ visibleKinds: {
		...state.visibleKinds,
		[kind]: !state.visibleKinds[kind]
	} })),
	setWeather: (weather) => set({ weather }),
	setFilterByWeather: (filterByWeather) => set({ filterByWeather }),
	setAreaFilter: (areaFilter) => set({ areaFilter }),
	setPlacing: (placing) => set({ placing }),
	select: (selectedId) => set({
		selectedId,
		justCreatedId: null
	}),
	addPin: (pin) => {
		const id = crypto.randomUUID();
		set((state) => ({
			pins: [...state.pins, {
				...pin,
				id
			}],
			selectedId: id,
			placing: false,
			justCreatedId: id
		}));
		return id;
	},
	updatePin: (id, patch) => set((state) => ({ pins: state.pins.map((pin) => pin.id === id ? {
		...pin,
		...patch,
		id
	} : pin) })),
	removePin: (id) => set((state) => ({
		pins: state.pins.filter((pin) => pin.id !== id),
		selectedId: state.selectedId === id ? null : state.selectedId
	})),
	replacePins: (pins) => set({
		pins,
		selectedId: null,
		justCreatedId: null
	})
}), {
	name: "ancient-forest-atlas",
	version: 1,
	skipHydration: true,
	partialize: (state) => ({
		layers: state.layers,
		pins: state.pins,
		visibleKinds: state.visibleKinds,
		weather: state.weather,
		filterByWeather: state.filterByWeather,
		areaFilter: state.areaFilter
	}),
	merge: (persisted, current) => {
		if (!persisted || typeof persisted !== "object") return current;
		const saved = persisted;
		const layers = defaultLayers();
		if (saved.layers) for (const id of layerIds) {
			const entry = saved.layers[id];
			if (!entry || typeof entry.opacity !== "number") continue;
			layers[id] = {
				visible: entry.visible !== false,
				opacity: Math.min(1, Math.max(.15, entry.opacity))
			};
		}
		const visibleKinds = defaultKinds();
		if (saved.visibleKinds) {
			for (const id of kindIds) if (typeof saved.visibleKinds[id] === "boolean") visibleKinds[id] = saved.visibleKinds[id];
		}
		const pins = Array.isArray(saved.pins) ? saved.pins.filter(isPin) : [];
		const weather = saved.weather;
		const safeWeather = weather === "clear" || weather === "rain" || weather === "fog" || weather === "night" ? weather : "clear";
		const areaFilter = typeof saved.areaFilter === "number" && saved.areaFilter >= 1 && saved.areaFilter <= 17 ? saved.areaFilter : null;
		return {
			...current,
			layers,
			pins,
			visibleKinds,
			weather: safeWeather,
			filterByWeather: saved.filterByWeather === true,
			areaFilter
		};
	}
}));
var LEVEL_BOUNDS = {
	lower: {
		x0: .15,
		y0: .16,
		x1: .95,
		y1: .99
	},
	middle: {
		x0: .35,
		y0: .28,
		x1: .75,
		y1: .6
	},
	upper: {
		x0: .49,
		y0: .2,
		x1: .81,
		y1: .55
	}
};
/** Prefer the topmost visible sheet under the click, so a pin lands on the parchment you actually hit. */
function levelAt(x, y, layers) {
	for (const id of [
		"upper",
		"middle",
		"lower"
	]) {
		if (!layers[id].visible) continue;
		const box = LEVEL_BOUNDS[id];
		if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) return id;
	}
	if (layers.lower.visible) return "lower";
	if (layers.middle.visible) return "middle";
	return "upper";
}
function pinShown(pin, state) {
	if (!state.visibleKinds[pin.kind]) return false;
	if (!state.layers[pin.level].visible) return false;
	if (state.areaFilter !== null && pin.area !== state.areaFilter) return false;
	if (state.filterByWeather && pin.weather.length > 0 && !pin.weather.includes(state.weather)) return false;
	return true;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function CodexPanel({ open, onToggle }) {
	const layers = useAtlas((state) => state.layers);
	const pins = useAtlas((state) => state.pins);
	const visibleKinds = useAtlas((state) => state.visibleKinds);
	const weather = useAtlas((state) => state.weather);
	const filterByWeather = useAtlas((state) => state.filterByWeather);
	const areaFilter = useAtlas((state) => state.areaFilter);
	const selectedId = useAtlas((state) => state.selectedId);
	const justCreatedId = useAtlas((state) => state.justCreatedId);
	const setLayerVisible = useAtlas((state) => state.setLayerVisible);
	const setLayerOpacity = useAtlas((state) => state.setLayerOpacity);
	const soloLayer = useAtlas((state) => state.soloLayer);
	const toggleKind = useAtlas((state) => state.toggleKind);
	const setWeather = useAtlas((state) => state.setWeather);
	const setFilterByWeather = useAtlas((state) => state.setFilterByWeather);
	const setAreaFilter = useAtlas((state) => state.setAreaFilter);
	const select = useAtlas((state) => state.select);
	const updatePin = useAtlas((state) => state.updatePin);
	const removePin = useAtlas((state) => state.removePin);
	const replacePins = useAtlas((state) => state.replacePins);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const nameRef = (0, import_react.useRef)(null);
	const selected = pins.find((pin) => pin.id === selectedId) ?? null;
	const visiblePins = pins.filter((pin) => pinShown(pin, {
		layers,
		visibleKinds,
		weather,
		filterByWeather,
		areaFilter
	}));
	(0, import_react.useEffect)(() => {
		if (selected && justCreatedId === selected.id) nameRef.current?.select();
	}, [justCreatedId, selected]);
	(0, import_react.useEffect)(() => {
		setConfirmDelete(false);
	}, [selectedId]);
	function exportCodex() {
		const blob = new Blob([JSON.stringify({
			schema: 1,
			locale: LOCALE_ID,
			pins
		}, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "ancient-forest-codex.json";
		link.click();
		URL.revokeObjectURL(url);
		setNotice("Codex downloaded.");
	}
	async function importCodex(file) {
		try {
			const parsed = codexFileSchema.safeParse(JSON.parse(await file.text()));
			if (!parsed.success) {
				setNotice("That file is not an Ancient Forest codex.");
				return;
			}
			replacePins(parsed.data.pins);
			setNotice(`Imported ${parsed.data.pins.length} pins.`);
		} catch {
			setNotice("Could not read that file.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "atlas-panel",
		"data-open": open ? "true" : "false",
		"aria-label": "Map codex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-h-11 items-center justify-between px-4 text-left md:hidden",
			onClick: onToggle,
			"aria-expanded": open,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: "Layers and codex"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-xs text-muted tabular-nums",
				children: [visiblePins.length, " shown"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("min-h-0 flex-1 flex-col overflow-y-auto", open ? "flex" : "hidden md:flex"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-2 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-medium tracking-tight",
						children: "Layers"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-1",
						children: LAYERS.map((layer) => {
							const setting = layers[layer.id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-md bg-raised px-2 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-h-11 items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-pressed": setting.visible,
											"aria-label": setting.visible ? `Hide ${layer.name}` : `Show ${layer.name}`,
											onClick: () => setLayerVisible(layer.id, !setting.visible),
											className: "flex size-11 shrink-0 items-center justify-center rounded-sm text-fg",
											children: setting.visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4 text-faint" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-medium",
												children: layer.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-xs text-muted",
												children: layer.detail
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => soloLayer(layer.id),
											className: "min-h-11 rounded-sm px-2 text-xs font-medium text-muted",
											children: "Only"
										})
									]
								}), setting.visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-3 px-2 pb-2 text-xs text-muted",
									children: [
										"Opacity",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "range",
											min: 15,
											max: 100,
											value: Math.round(setting.opacity * 100),
											"aria-label": `${layer.name} opacity`,
											onChange: (event) => setLayerOpacity(layer.id, Number(event.target.value) / 100),
											className: "min-w-0 flex-1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-8 text-right tabular-nums",
											children: Math.round(setting.opacity * 100)
										})
									]
								}) : null]
							}, layer.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-3 border-t border-line px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-medium tracking-tight",
							children: "Atmosphere"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-1",
							role: "group",
							"aria-label": "Atmosphere",
							children: WEATHERS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": weather === entry.id,
								onClick: () => setWeather(entry.id),
								className: cn("min-h-11 rounded-sm text-xs font-medium", weather === entry.id ? "bg-accent text-accent-fg" : "bg-raised text-muted"),
								children: entry.name
							}, entry.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": filterByWeather,
							onClick: () => setFilterByWeather(!filterByWeather),
							className: "min-h-11 rounded-md border border-line px-3 text-left text-sm text-fg",
							children: filterByWeather ? "Pins follow this atmosphere" : "Show pins in every atmosphere"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-normal text-muted",
							children: "Weather tags on a pin are optional. Empty means it stays visible. Use them later for spawns that only appear in rain or at night."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-3 border-t border-line px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-medium tracking-tight",
								children: "Codex"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted tabular-nums",
								children: [pins.length, " pins"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-1",
							children: PIN_KINDS.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": visibleKinds[kind.id],
								onClick: () => toggleKind(kind.id),
								className: cn("min-h-11 rounded-sm px-2 text-sm font-medium", visibleKinds[kind.id] ? "bg-accent text-accent-fg" : "bg-raised text-faint"),
								children: kind.name
							}, kind.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-xs text-muted",
							children: ["Area", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: areaFilter ?? "",
								onChange: (event) => setAreaFilter(event.target.value ? Number(event.target.value) : null),
								className: "min-h-11 rounded-sm border border-line bg-raised px-3 text-sm text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "All 17 areas"
								}), AREAS.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: area,
									children: ["Area ", area]
								}, area))]
							})]
						}),
						selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinEditor, {
							pin: selected,
							nameRef,
							confirmDelete,
							onConfirmDelete: () => setConfirmDelete(true),
							onChange: (patch) => updatePin(selected.id, patch),
							onDelete: () => removePin(selected.id),
							onBack: () => select(null)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinList, {
							pins: visiblePins,
							onOpen: (id) => {
								select(id);
								window.dispatchEvent(new CustomEvent("atlas-focus-pin", { detail: id }));
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: exportCodex,
									className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Export"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => fileRef.current?.click(),
									className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), "Import"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "application/json",
									className: "sr-only",
									onChange: (event) => {
										const file = event.target.files?.[0];
										if (file) importCodex(file);
										event.target.value = "";
									}
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs leading-normal text-muted",
							children: "Pins stay in this browser. Export the codex when you want the wiki to keep them."
						}),
						notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: notice
						}) : null
					]
				})
			]
		})]
	});
}
function PinList({ pins, onOpen }) {
	if (pins.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-md border border-dashed border-line px-3 py-4 text-sm leading-normal text-muted",
		children: "No pins in this view. Place one on the map — camps, gathering, monsters, and weather all live in the same codex."
	});
	const ordered = [...pins].sort((a, b) => (a.area ?? 99) - (b.area ?? 99) || a.name.localeCompare(b.name));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-1",
		children: ordered.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpen(pin.id),
			className: "flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left hover:bg-raised",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pin-dot shrink-0",
				"data-kind": pin.kind
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-sm",
					children: pin.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block truncate text-xs text-muted",
					children: [LEVEL_SHORT[pin.level], pin.area ? ` · Area ${pin.area}` : ""]
				})]
			})]
		}) }, pin.id))
	});
}
function PinEditor({ pin, nameRef, confirmDelete, onConfirmDelete, onChange, onDelete, onBack }) {
	function toggleWeather(id) {
		onChange({ weather: pin.weather.includes(id) ? pin.weather.filter((entry) => entry !== id) : [...pin.weather, id] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-col gap-3 rounded-lg bg-raised p-3",
		onSubmit: (event) => {
			event.preventDefault();
			onBack();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: "Selected pin"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onBack,
					className: "min-h-11 px-2 text-xs font-medium text-muted",
					children: "Back to list"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-xs text-muted",
				children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: nameRef,
					value: pin.name,
					onChange: (event) => onChange({ name: event.target.value.slice(0, 80) }),
					list: pin.kind === "monster" ? "monster-suggestions" : void 0,
					className: "min-h-11 rounded-sm border border-line bg-surface px-3 text-sm text-fg"
				})]
			}),
			pin.kind === "monster" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
				id: "monster-suggestions",
				children: MONSTER_SUGGESTIONS.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: name }, name))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1",
				role: "group",
				"aria-label": "Pin kind",
				children: PIN_KINDS.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": pin.kind === kind.id,
					onClick: () => onChange({ kind: kind.id }),
					className: cn("min-h-11 rounded-sm text-xs font-medium", pin.kind === kind.id ? "bg-accent text-accent-fg" : "bg-surface text-muted"),
					children: kind.name
				}, kind.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1",
				role: "group",
				"aria-label": "Elevation",
				children: [
					"lower",
					"middle",
					"upper"
				].map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": pin.level === level,
					onClick: () => onChange({ level }),
					className: cn("min-h-11 rounded-sm text-xs font-medium", pin.level === level ? "bg-accent text-accent-fg" : "bg-surface text-muted"),
					children: LEVEL_SHORT[level]
				}, level))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-xs text-muted",
				children: ["Area", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: pin.area ?? "",
					onChange: (event) => onChange({ area: event.target.value ? Number(event.target.value) : null }),
					className: "min-h-11 rounded-sm border border-line bg-surface px-3 text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Unassigned"
					}), AREAS.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: area,
						children: ["Area ", area]
					}, area))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "text-xs text-muted",
					children: "Weather tags"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1",
					children: WEATHERS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": pin.weather.includes(entry.id),
						onClick: () => toggleWeather(entry.id),
						className: cn("min-h-11 rounded-sm text-xs font-medium", pin.weather.includes(entry.id) ? "bg-accent text-accent-fg" : "bg-surface text-muted"),
						children: entry.name
					}, entry.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-xs text-muted",
				children: ["Notes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: pin.note,
					rows: 3,
					onChange: (event) => onChange({ note: event.target.value.slice(0, 500) }),
					placeholder: "What a hunter should know",
					className: "rounded-sm border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "min-h-11 flex-1 rounded-md bg-accent text-sm font-medium text-accent-fg",
					children: "Done"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => confirmDelete ? onDelete() : onConfirmDelete(),
					className: "flex min-h-11 items-center gap-2 rounded-md border border-line px-3 text-sm text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), confirmDelete ? "Confirm" : "Delete"]
				})]
			})
		]
	});
}
var MIN_SCALE = .85;
var MAX_SCALE = 7;
function baseSize(width, height) {
	return Math.min(width, height);
}
function clampScale(scale) {
	return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}
function clampView(view, width, height) {
	const size = baseSize(width, height) * view.scale;
	const margin = 72;
	return {
		scale: view.scale,
		x: Math.min(width - margin, Math.max(margin - size, view.x)),
		y: Math.min(height - margin, Math.max(margin - size, view.y))
	};
}
function fitView(width, height) {
	const size = baseSize(width, height);
	return {
		scale: 1,
		x: (width - size) / 2,
		y: (height - size) / 2
	};
}
function MapStage() {
	const paneRef = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)({
		x: 0,
		y: 0,
		scale: 1
	});
	const paneSize = (0, import_react.useRef)({
		width: 0,
		height: 0
	});
	const gesture = (0, import_react.useRef)(null);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [view, setView] = (0, import_react.useState)({
		x: 0,
		y: 0,
		scale: 1
	});
	const [ready, setReady] = (0, import_react.useState)(false);
	const layers = useAtlas((state) => state.layers);
	const pins = useAtlas((state) => state.pins);
	const visibleKinds = useAtlas((state) => state.visibleKinds);
	const weather = useAtlas((state) => state.weather);
	const filterByWeather = useAtlas((state) => state.filterByWeather);
	const areaFilter = useAtlas((state) => state.areaFilter);
	const placing = useAtlas((state) => state.placing);
	const selectedId = useAtlas((state) => state.selectedId);
	const select = useAtlas((state) => state.select);
	const addPin = useAtlas((state) => state.addPin);
	const setPlacing = useAtlas((state) => state.setPlacing);
	viewRef.current = view;
	function commit(next) {
		const size = paneSize.current;
		const clamped = clampView(next, size.width, size.height);
		viewRef.current = clamped;
		setView(clamped);
	}
	function zoomAt(factor, paneX, paneY) {
		const size = paneSize.current;
		const current = viewRef.current;
		const base = baseSize(size.width, size.height);
		const world = base * current.scale;
		if (world <= 0) return;
		const wx = (paneX - current.x) / world;
		const wy = (paneY - current.y) / world;
		const scale = clampScale(current.scale * factor);
		commit({
			scale,
			x: paneX - wx * base * scale,
			y: paneY - wy * base * scale
		});
	}
	function focusPin(pin) {
		const size = paneSize.current;
		const base = baseSize(size.width, size.height);
		const scale = clampScale(Math.max(viewRef.current.scale, 2.1));
		commit({
			scale,
			x: size.width / 2 - pin.x * base * scale,
			y: size.height / 2 - pin.y * base * scale
		});
	}
	(0, import_react.useEffect)(() => {
		const pane = paneRef.current;
		if (!pane) return;
		const measure = () => {
			const rect = pane.getBoundingClientRect();
			const prev = paneSize.current;
			paneSize.current = {
				width: rect.width,
				height: rect.height
			};
			if (prev.width === 0) {
				const fitted = fitView(rect.width, rect.height);
				viewRef.current = fitted;
				setView(fitted);
				setReady(true);
				return;
			}
			const current = viewRef.current;
			const prevBase = baseSize(prev.width, prev.height);
			const nextBase = baseSize(rect.width, rect.height);
			const cx = (prev.width / 2 - current.x) / (prevBase * current.scale);
			const cy = (prev.height / 2 - current.y) / (prevBase * current.scale);
			const next = clampView({
				scale: current.scale,
				x: rect.width / 2 - cx * nextBase * current.scale,
				y: rect.height / 2 - cy * nextBase * current.scale
			}, rect.width, rect.height);
			viewRef.current = next;
			setView(next);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(pane);
		const onWheel = (event) => {
			event.preventDefault();
			const rect = pane.getBoundingClientRect();
			zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX - rect.left, event.clientY - rect.top);
		};
		pane.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			observer.disconnect();
			pane.removeEventListener("wheel", onWheel);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			const target = event.target;
			if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
			if (event.key === "Escape") {
				setPlacing(false);
				select(null);
			} else if (event.key === "+" || event.key === "=") {
				const size = paneSize.current;
				zoomAt(1.2, size.width / 2, size.height / 2);
			} else if (event.key === "-" || event.key === "_") {
				const size = paneSize.current;
				zoomAt(1 / 1.2, size.width / 2, size.height / 2);
			} else if (event.key === "0") {
				const size = paneSize.current;
				commit(fitView(size.width, size.height));
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [select, setPlacing]);
	(0, import_react.useEffect)(() => {
		const onFocus = (event) => {
			const id = event.detail;
			const pin = useAtlas.getState().pins.find((entry) => entry.id === id);
			if (pin) focusPin(pin);
		};
		window.addEventListener("atlas-focus-pin", onFocus);
		return () => window.removeEventListener("atlas-focus-pin", onFocus);
	}, []);
	function panePoint(event) {
		const rect = paneRef.current.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}
	function toNorm(clientX, clientY) {
		const pane = paneRef.current;
		if (!pane) return null;
		const rect = pane.getBoundingClientRect();
		const current = viewRef.current;
		const base = baseSize(rect.width, rect.height) * current.scale;
		if (base <= 0) return null;
		const x = (clientX - rect.left - current.x) / base;
		const y = (clientY - rect.top - current.y) / base;
		if (x < 0 || y < 0 || x > 1 || y > 1) return null;
		return {
			x,
			y
		};
	}
	function onPointerDown(event) {
		if (event.button !== 0) return;
		const point = panePoint(event);
		pointers.current.set(event.pointerId, point);
		event.currentTarget.setPointerCapture(event.pointerId);
		if (pointers.current.size === 1) {
			gesture.current = {
				type: "pan",
				id: event.pointerId,
				lastX: point.x,
				lastY: point.y,
				moved: false
			};
			return;
		}
		if (pointers.current.size === 2) {
			const [a, b] = [...pointers.current.values()];
			const midX = (a.x + b.x) / 2;
			const midY = (a.y + b.y) / 2;
			const current = viewRef.current;
			const base = baseSize(paneSize.current.width, paneSize.current.height) * current.scale;
			gesture.current = {
				type: "pinch",
				startDist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
				startScale: current.scale,
				wx: (midX - current.x) / base,
				wy: (midY - current.y) / base
			};
		}
	}
	function onPointerMove(event) {
		if (!pointers.current.has(event.pointerId)) return;
		const point = panePoint(event);
		pointers.current.set(event.pointerId, point);
		const active = gesture.current;
		if (!active) return;
		if (active.type === "pan" && active.id === event.pointerId) {
			const dx = point.x - active.lastX;
			const dy = point.y - active.lastY;
			if (Math.hypot(dx, dy) > 3) active.moved = true;
			active.lastX = point.x;
			active.lastY = point.y;
			if (!active.moved) return;
			const current = viewRef.current;
			commit({
				...current,
				x: current.x + dx,
				y: current.y + dy
			});
			return;
		}
		if (active.type === "pinch" && pointers.current.size >= 2) {
			const [a, b] = [...pointers.current.values()];
			const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
			const midX = (a.x + b.x) / 2;
			const midY = (a.y + b.y) / 2;
			const scale = clampScale(active.startScale * (dist / active.startDist));
			const base = baseSize(paneSize.current.width, paneSize.current.height);
			commit({
				scale,
				x: midX - active.wx * base * scale,
				y: midY - active.wy * base * scale
			});
		}
	}
	function endPointer(event) {
		const active = gesture.current;
		pointers.current.delete(event.pointerId);
		if (active?.type === "pan" && active.id === event.pointerId && !active.moved) {
			const point = toNorm(event.clientX, event.clientY);
			if (placing && point) {
				const state = useAtlas.getState();
				addPin({
					kind: "interactable",
					name: "New pin",
					note: "",
					x: point.x,
					y: point.y,
					level: levelAt(point.x, point.y, state.layers),
					area: state.areaFilter,
					weather: []
				});
			} else if (!placing) select(null);
		}
		if (pointers.current.size < 2 && active?.type === "pinch") gesture.current = null;
		if (pointers.current.size === 0) gesture.current = null;
	}
	const shown = pins.filter((pin) => pinShown(pin, {
		layers,
		visibleKinds,
		weather,
		filterByWeather,
		areaFilter
	}));
	const size = baseSize(paneSize.current.width, paneSize.current.height);
	const weatherName = WEATHERS.find((entry) => entry.id === weather)?.name ?? "Clear";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "atlas-stage",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: paneRef,
				className: cn("map-pane", placing ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"),
				role: "application",
				"aria-label": "Ancient Forest map. Drag to pan, scroll or pinch to zoom.",
				onPointerDown,
				onPointerMove,
				onPointerUp: endPointer,
				onPointerCancel: endPointer,
				onDoubleClick: (event) => {
					if (placing) return;
					const rect = paneRef.current.getBoundingClientRect();
					zoomAt(1.6, event.clientX - rect.left, event.clientY - rect.top);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "map-world",
					style: {
						width: size || 1,
						height: size || 1,
						transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
						opacity: ready ? 1 : 0
					},
					children: [
						LAYERS.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: layer.src,
							alt: layer.alt,
							draggable: false,
							className: "map-layer",
							style: { opacity: layers[layer.id].visible ? layers[layer.id].opacity : 0 }
						}, layer.id)),
						weather !== "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("atmosphere", `atmosphere-${weather}`) }) : null,
						shown.map((pin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinMarker, {
							pin,
							scale: view.scale,
							selected: pin.id === selectedId,
							onSelect: () => {
								select(pin.id);
								setPlacing(false);
							}
						}, pin.id))
					]
				})
			}),
			placing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute top-4 right-20 left-4 z-10 rounded-md border border-line bg-surface px-4 py-2 text-sm text-fg",
				children: "Click the sheet to drop a pin"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-md bg-surface px-3 py-2 text-xs text-muted md:block",
				children: ["Drag to pan · scroll to zoom · ", weatherName]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute bottom-16 left-4 z-10 text-xs text-muted md:hidden",
				children: "Drag to move · pinch to zoom"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-4 right-4 z-10 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomButton, {
						label: "Zoom in",
						onClick: () => zoomAt(1.25, paneSize.current.width / 2, paneSize.current.height / 2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomButton, {
						label: "Zoom out",
						onClick: () => zoomAt(1 / 1.25, paneSize.current.width / 2, paneSize.current.height / 2),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomButton, {
						label: "Fit the map",
						onClick: () => commit(fitView(paneSize.current.width, paneSize.current.height)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-md bg-surface px-1 py-2 text-center text-xs text-muted tabular-nums",
						children: [Math.round(view.scale * 100), "%"]
					})
				]
			})
		]
	});
}
function ZoomButton({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "flex size-11 items-center justify-center rounded-md border border-line bg-surface text-fg active:opacity-80",
		children
	});
}
function PinMarker({ pin, scale, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pin-anchor",
		"data-kind": pin.kind,
		"data-selected": selected ? "true" : "false",
		style: {
			left: `${pin.x * 100}%`,
			top: `${pin.y * 100}%`,
			transform: `translate(-50%, -50%) scale(${1 / scale})`
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": pin.name,
			"aria-pressed": selected,
			className: "flex size-11 items-center justify-center",
			onPointerDown: (event) => event.stopPropagation(),
			onClick: (event) => {
				event.stopPropagation();
				onSelect();
			},
			onDoubleClick: (event) => event.stopPropagation(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pin-dot" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pin-label",
			children: pin.name
		})]
	});
}
function AtlasApp() {
	const [sheetOpen, setSheetOpen] = (0, import_react.useState)(false);
	const placing = useAtlas((state) => state.placing);
	const setPlacing = useAtlas((state) => state.setPlacing);
	const selectedId = useAtlas((state) => state.selectedId);
	(0, import_react.useEffect)(() => {
		useAtlas.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		if (placing) setSheetOpen(false);
	}, [placing]);
	(0, import_react.useEffect)(() => {
		if (selectedId) setSheetOpen(true);
	}, [selectedId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "atlas-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex min-h-14 items-center justify-between gap-3 border-b border-line px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Locale atlas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate font-display text-xl font-medium tracking-tight",
					children: "Ancient Forest"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-pressed": placing,
				onClick: () => setPlacing(!placing),
				className: cn("flex min-h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium active:opacity-80", placing ? "bg-raised text-fg" : "bg-accent text-accent-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }), placing ? "Cancel" : "Place pin"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "atlas-body",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodexPanel, {
				open: sheetOpen,
				onToggle: () => setSheetOpen((value) => !value)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapStage, {})]
		})]
	});
}
var SplitComponent = AtlasApp;
//#endregion
export { SplitComponent as component };
