import { useEffect, useRef, useState, type ReactNode } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { LAYERS, WEATHERS, type Pin } from "@/data/atlas";
import { levelAt, pinShown, useAtlas } from "@/lib/atlas-store";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.85;
const MAX_SCALE = 7;

type View = { x: number; y: number; scale: number };

type PanGesture = {
  type: "pan";
  id: number;
  lastX: number;
  lastY: number;
  moved: boolean;
};

type PinchGesture = {
  type: "pinch";
  startDist: number;
  startScale: number;
  wx: number;
  wy: number;
};

function baseSize(width: number, height: number) {
  return Math.min(width, height);
}

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function clampView(view: View, width: number, height: number): View {
  const size = baseSize(width, height) * view.scale;
  const margin = 72;
  return {
    scale: view.scale,
    x: Math.min(width - margin, Math.max(margin - size, view.x)),
    y: Math.min(height - margin, Math.max(margin - size, view.y)),
  };
}

function fitView(width: number, height: number): View {
  const size = baseSize(width, height);
  return { scale: 1, x: (width - size) / 2, y: (height - size) / 2 };
}

export function MapStage() {
  const paneRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ x: 0, y: 0, scale: 1 });
  const paneSize = useRef({ width: 0, height: 0 });
  const gesture = useRef<PanGesture | PinchGesture | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [ready, setReady] = useState(false);

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

  function commit(next: View) {
    const size = paneSize.current;
    const clamped = clampView(next, size.width, size.height);
    viewRef.current = clamped;
    setView(clamped);
  }

  function zoomAt(factor: number, paneX: number, paneY: number) {
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
      y: paneY - wy * base * scale,
    });
  }

  function focusPin(pin: Pin) {
    const size = paneSize.current;
    const base = baseSize(size.width, size.height);
    const scale = clampScale(Math.max(viewRef.current.scale, 2.1));
    commit({
      scale,
      x: size.width / 2 - pin.x * base * scale,
      y: size.height / 2 - pin.y * base * scale,
    });
  }

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const measure = () => {
      const rect = pane.getBoundingClientRect();
      const prev = paneSize.current;
      paneSize.current = { width: rect.width, height: rect.height };
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
      const next = clampView(
        {
          scale: current.scale,
          x: rect.width / 2 - cx * nextBase * current.scale,
          y: rect.height / 2 - cy * nextBase * current.scale,
        },
        rect.width,
        rect.height,
      );
      viewRef.current = next;
      setView(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = pane.getBoundingClientRect();
      const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
      zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
    };
    pane.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      pane.removeEventListener("wheel", onWheel);
    };
    // zoomAt closes over the latest commit path via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
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

  useEffect(() => {
    const onFocus = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const pin = useAtlas.getState().pins.find((entry) => entry.id === id);
      if (pin) focusPin(pin);
    };
    window.addEventListener("atlas-focus-pin", onFocus);
    return () => window.removeEventListener("atlas-focus-pin", onFocus);
  }, []);

  function panePoint(event: React.PointerEvent) {
    const rect = paneRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function toNorm(clientX: number, clientY: number) {
    const pane = paneRef.current;
    if (!pane) return null;
    const rect = pane.getBoundingClientRect();
    const current = viewRef.current;
    const base = baseSize(rect.width, rect.height) * current.scale;
    if (base <= 0) return null;
    const x = (clientX - rect.left - current.x) / base;
    const y = (clientY - rect.top - current.y) / base;
    if (x < 0 || y < 0 || x > 1 || y > 1) return null;
    return { x, y };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const point = panePoint(event);
    pointers.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 1) {
      gesture.current = { type: "pan", id: event.pointerId, lastX: point.x, lastY: point.y, moved: false };
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
        wy: (midY - current.y) / base,
      };
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
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
      commit({ ...current, x: current.x + dx, y: current.y + dy });
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
        y: midY - active.wy * base * scale,
      });
    }
  }

  function endPointer(event: React.PointerEvent<HTMLDivElement>) {
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
          weather: [],
        });
      } else if (!placing) {
        select(null);
      }
    }
    if (pointers.current.size < 2 && active?.type === "pinch") {
      gesture.current = null;
    }
    if (pointers.current.size === 0) gesture.current = null;
  }

  const shown = pins.filter((pin) =>
    pinShown(pin, { layers, visibleKinds, weather, filterByWeather, areaFilter }),
  );
  const size = baseSize(paneSize.current.width, paneSize.current.height);
  const weatherName = WEATHERS.find((entry) => entry.id === weather)?.name ?? "Clear";

  return (
    <div className="atlas-stage">
      <div
        ref={paneRef}
        className={cn("map-pane", placing ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")}
        role="application"
        aria-label="Ancient Forest map. Drag to pan, scroll or pinch to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={(event) => {
          if (placing) return;
          const rect = paneRef.current!.getBoundingClientRect();
          zoomAt(1.6, event.clientX - rect.left, event.clientY - rect.top);
        }}
      >
        <div
          className="map-world"
          style={{
            width: size || 1,
            height: size || 1,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            opacity: ready ? 1 : 0,
          }}
        >
          {LAYERS.map((layer) => (
            <img
              key={layer.id}
              src={layer.src}
              alt={layer.alt}
              draggable={false}
              className="map-layer"
              style={{ opacity: layers[layer.id].visible ? layers[layer.id].opacity : 0 }}
            />
          ))}
          {weather !== "clear" ? <div className={cn("atmosphere", `atmosphere-${weather}`)} /> : null}
          {shown.map((pin) => (
            <PinMarker
              key={pin.id}
              pin={pin}
              scale={view.scale}
              selected={pin.id === selectedId}
              onSelect={() => {
                select(pin.id);
                setPlacing(false);
              }}
            />
          ))}
        </div>
      </div>

      {placing ? (
        <p className="pointer-events-none absolute top-4 right-20 left-4 z-10 rounded-md border border-line bg-surface px-4 py-2 text-sm text-fg">
          Click the sheet to drop a pin
        </p>
      ) : null}

      <p className="pointer-events-none absolute bottom-4 left-4 z-10 hidden rounded-md bg-surface px-3 py-2 text-xs text-muted md:block">
        Drag to pan · scroll to zoom · {weatherName}
      </p>
      <p className="pointer-events-none absolute bottom-16 left-4 z-10 text-xs text-muted md:hidden">
        Drag to move · pinch to zoom
      </p>

      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <ZoomButton label="Zoom in" onClick={() => zoomAt(1.25, paneSize.current.width / 2, paneSize.current.height / 2)}>
          <Plus className="size-4" />
        </ZoomButton>
        <ZoomButton label="Zoom out" onClick={() => zoomAt(1 / 1.25, paneSize.current.width / 2, paneSize.current.height / 2)}>
          <Minus className="size-4" />
        </ZoomButton>
        <ZoomButton
          label="Fit the map"
          onClick={() => commit(fitView(paneSize.current.width, paneSize.current.height))}
        >
          <LocateFixed className="size-4" />
        </ZoomButton>
        <p className="rounded-md bg-surface px-1 py-2 text-center text-xs text-muted tabular-nums">
          {Math.round(view.scale * 100)}%
        </p>
      </div>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-md border border-line bg-surface text-fg active:opacity-80"
    >
      {children}
    </button>
  );
}

function PinMarker({
  pin,
  scale,
  selected,
  onSelect,
}: {
  pin: Pin;
  scale: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className="pin-anchor"
      data-kind={pin.kind}
      data-selected={selected ? "true" : "false"}
      style={{
        left: `${pin.x * 100}%`,
        top: `${pin.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${1 / scale})`,
      }}
    >
      <button
        type="button"
        aria-label={pin.name}
        aria-pressed={selected}
        className="flex size-11 items-center justify-center"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <span className="pin-dot" />
      </button>
      <span className="pin-label">{pin.name}</span>
    </div>
  );
}
