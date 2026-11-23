import { useEffect, useRef, useState, type RefObject } from "react";
import { Download, Eye, EyeOff, Trash2, Upload } from "lucide-react";
import {
  AREAS,
  CODEX_SCHEMA,
  codexFileSchema,
  LAYERS,
  LEVEL_SHORT,
  LOCALE_ID,
  MONSTER_SUGGESTIONS,
  PIN_KINDS,
  WEATHERS,
  type OverlayId,
  type Pin,
  type PinKind,
  type WeatherId,
} from "@/data/atlas";
import { pinShown, useAtlas } from "@/lib/atlas-store";
import { cn } from "@/lib/utils";

export function CodexPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
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

  const [notice, setNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const selected = pins.find((pin) => pin.id === selectedId) ?? null;
  const visiblePins = pins.filter((pin) =>
    pinShown(pin, { layers, visibleKinds, weather, filterByWeather, areaFilter }),
  );

  useEffect(() => {
    if (selected && justCreatedId === selected.id) nameRef.current?.select();
  }, [justCreatedId, selected]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedId]);

  function exportCodex() {
    const payload = { schema: CODEX_SCHEMA, locale: LOCALE_ID, pins };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ancient-forest-codex.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Codex downloaded.");
  }

  async function importCodex(file: File) {
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

  return (
    <aside className="atlas-panel" data-open={open ? "true" : "false"} aria-label="Map codex">
      <button
        type="button"
        className="flex min-h-11 items-center justify-between px-4 text-left md:hidden"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="text-sm font-medium">Layers and codex</span>
        <span className="text-xs text-muted tabular-nums">{visiblePins.length} shown</span>
      </button>

      <div className={cn("min-h-0 flex-1 flex-col overflow-y-auto", open ? "flex" : "hidden md:flex")}>
        <section className="flex flex-col gap-2 px-4 py-4">
          <h2 className="font-display text-lg font-medium tracking-tight">Layers</h2>
          <ul className="flex flex-col gap-1">
            {LAYERS.map((layer) => {
              const setting = layers[layer.id];
              return (
                <li key={layer.id} className="rounded-md bg-raised px-2 py-1">
                  <div className="flex min-h-11 items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={setting.visible}
                      aria-label={setting.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                      onClick={() => setLayerVisible(layer.id, !setting.visible)}
                      className="flex size-11 shrink-0 items-center justify-center rounded-sm text-fg"
                    >
                      {setting.visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-faint" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{layer.name}</p>
                      <p className="truncate text-xs text-muted">{layer.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => soloLayer(layer.id)}
                      className="min-h-11 rounded-sm px-2 text-xs font-medium text-muted"
                    >
                      Only
                    </button>
                  </div>
                  {setting.visible ? (
                    <label className="flex items-center gap-3 px-2 pb-2 text-xs text-muted">
                      Opacity
                      <input
                        type="range"
                        min={15}
                        max={100}
                        value={Math.round(setting.opacity * 100)}
                        aria-label={`${layer.name} opacity`}
                        onChange={(event) => setLayerOpacity(layer.id, Number(event.target.value) / 100)}
                        className="min-w-0 flex-1"
                      />
                      <span className="w-8 text-right tabular-nums">{Math.round(setting.opacity * 100)}</span>
                    </label>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-3 border-t border-line px-4 py-4">
          <h2 className="font-display text-lg font-medium tracking-tight">Atmosphere</h2>
          <div className="grid grid-cols-4 gap-1" role="group" aria-label="Atmosphere">
            {WEATHERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={weather === entry.id}
                onClick={() => setWeather(entry.id)}
                className={cn(
                  "min-h-11 rounded-sm text-xs font-medium",
                  weather === entry.id ? "bg-accent text-accent-fg" : "bg-raised text-muted",
                )}
              >
                {entry.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={filterByWeather}
            onClick={() => setFilterByWeather(!filterByWeather)}
            className="min-h-11 rounded-md border border-line px-3 text-left text-sm text-fg"
          >
            {filterByWeather ? "Pins follow this atmosphere" : "Show pins in every atmosphere"}
          </button>
          <p className="text-xs leading-normal text-muted">
            Weather tags on a pin are optional. Empty means it stays visible. Use them later for spawns that only
            appear in rain or at night.
          </p>
        </section>

        <section className="flex flex-col gap-3 border-t border-line px-4 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-medium tracking-tight">Codex</h2>
            <span className="text-xs text-muted tabular-nums">{pins.length} pins</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {PIN_KINDS.map((kind) => (
              <button
                key={kind.id}
                type="button"
                aria-pressed={visibleKinds[kind.id]}
                onClick={() => toggleKind(kind.id)}
                className={cn(
                  "min-h-11 rounded-sm px-2 text-sm font-medium",
                  visibleKinds[kind.id] ? "bg-accent text-accent-fg" : "bg-raised text-faint",
                )}
              >
                {kind.name}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Area
            <select
              value={areaFilter ?? ""}
              onChange={(event) => setAreaFilter(event.target.value ? Number(event.target.value) : null)}
              className="min-h-11 rounded-sm border border-line bg-raised px-3 text-sm text-fg"
            >
              <option value="">All 17 areas</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  Area {area}
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <PinEditor
              pin={selected}
              nameRef={nameRef}
              confirmDelete={confirmDelete}
              onConfirmDelete={() => setConfirmDelete(true)}
              onChange={(patch) => updatePin(selected.id, patch)}
              onDelete={() => removePin(selected.id)}
              onBack={() => select(null)}
            />
          ) : (
            <PinList
              pins={visiblePins}
              onOpen={(id) => {
                select(id);
                window.dispatchEvent(new CustomEvent("atlas-focus-pin", { detail: id }));
              }}
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportCodex}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm font-medium"
            >
              <Download className="size-4" />
              Export
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-line text-sm font-medium"
            >
              <Upload className="size-4" />
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importCodex(file);
                event.target.value = "";
              }}
            />
          </div>
          <p className="text-xs leading-normal text-muted">
            Pins stay in this browser. Export the codex when you want the wiki to keep them.
          </p>
          {notice ? <p className="text-xs text-muted">{notice}</p> : null}
        </section>
      </div>
    </aside>
  );
}

function PinList({ pins, onOpen }: { pins: Pin[]; onOpen: (id: string) => void }) {
  if (pins.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-line px-3 py-4 text-sm leading-normal text-muted">
        No pins in this view. Place one on the map — camps, gathering, monsters, and weather all live in the same
        codex.
      </p>
    );
  }

  const ordered = [...pins].sort((a, b) => (a.area ?? 99) - (b.area ?? 99) || a.name.localeCompare(b.name));

  return (
    <ul className="flex flex-col gap-1">
      {ordered.map((pin) => (
        <li key={pin.id}>
          <button
            type="button"
            onClick={() => onOpen(pin.id)}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-left hover:bg-raised"
          >
            <span className="pin-dot shrink-0" data-kind={pin.kind} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{pin.name}</span>
              <span className="block truncate text-xs text-muted">
                {LEVEL_SHORT[pin.level]}
                {pin.area ? ` · Area ${pin.area}` : ""}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function PinEditor({
  pin,
  nameRef,
  confirmDelete,
  onConfirmDelete,
  onChange,
  onDelete,
  onBack,
}: {
  pin: Pin;
  nameRef: RefObject<HTMLInputElement | null>;
  confirmDelete: boolean;
  onConfirmDelete: () => void;
  onChange: (patch: Partial<Omit<Pin, "id">>) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  function toggleWeather(id: WeatherId) {
    const weather = pin.weather.includes(id) ? pin.weather.filter((entry) => entry !== id) : [...pin.weather, id];
    onChange({ weather });
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg bg-raised p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onBack();
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Selected pin</h3>
        <button type="button" onClick={onBack} className="min-h-11 px-2 text-xs font-medium text-muted">
          Back to list
        </button>
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Name
        <input
          ref={nameRef}
          value={pin.name}
          onChange={(event) => onChange({ name: event.target.value.slice(0, 80) })}
          list={pin.kind === "monster" ? "monster-suggestions" : undefined}
          className="min-h-11 rounded-sm border border-line bg-surface px-3 text-sm text-fg"
        />
      </label>
      {pin.kind === "monster" ? (
        <datalist id="monster-suggestions">
          {MONSTER_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      ) : null}
      <div className="grid grid-cols-2 gap-1" role="group" aria-label="Pin kind">
        {PIN_KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            aria-pressed={pin.kind === kind.id}
            onClick={() => onChange({ kind: kind.id as PinKind })}
            className={cn(
              "min-h-11 rounded-sm text-xs font-medium",
              pin.kind === kind.id ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {kind.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="Elevation">
        {(["lower", "middle", "upper"] as OverlayId[]).map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={pin.level === level}
            onClick={() => onChange({ level })}
            className={cn(
              "min-h-11 rounded-sm text-xs font-medium",
              pin.level === level ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {LEVEL_SHORT[level]}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Area
        <select
          value={pin.area ?? ""}
          onChange={(event) => onChange({ area: event.target.value ? Number(event.target.value) : null })}
          className="min-h-11 rounded-sm border border-line bg-surface px-3 text-sm text-fg"
        >
          <option value="">Unassigned</option>
          {AREAS.map((area) => (
            <option key={area} value={area}>
              Area {area}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs text-muted">Weather tags</legend>
        <div className="grid grid-cols-4 gap-1">
          {WEATHERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={pin.weather.includes(entry.id)}
              onClick={() => toggleWeather(entry.id)}
              className={cn(
                "min-h-11 rounded-sm text-xs font-medium",
                pin.weather.includes(entry.id) ? "bg-accent text-accent-fg" : "bg-surface text-muted",
              )}
            >
              {entry.name}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Notes
        <textarea
          value={pin.note}
          rows={3}
          onChange={(event) => onChange({ note: event.target.value.slice(0, 500) })}
          placeholder="What a hunter should know"
          className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint"
        />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="min-h-11 flex-1 rounded-md bg-accent text-sm font-medium text-accent-fg">
          Done
        </button>
        <button
          type="button"
          onClick={() => (confirmDelete ? onDelete() : onConfirmDelete())}
          className="flex min-h-11 items-center gap-2 rounded-md border border-line px-3 text-sm text-fg"
        >
          <Trash2 className="size-4" />
          {confirmDelete ? "Confirm" : "Delete"}
        </button>
      </div>
    </form>
  );
}
