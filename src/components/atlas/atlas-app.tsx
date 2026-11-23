import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { CodexPanel } from "@/components/atlas/codex-panel";
import { MapStage } from "@/components/atlas/map-stage";
import { useAtlas } from "@/lib/atlas-store";
import { cn } from "@/lib/utils";

export function AtlasApp() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const placing = useAtlas((state) => state.placing);
  const setPlacing = useAtlas((state) => state.setPlacing);
  const selectedId = useAtlas((state) => state.selectedId);

  useEffect(() => {
    void useAtlas.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (placing) setSheetOpen(false);
  }, [placing]);

  useEffect(() => {
    if (selectedId) setSheetOpen(true);
  }, [selectedId]);

  return (
    <div className="atlas-shell">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4">
        <div className="min-w-0">
          <p className="text-xs text-muted">Locale atlas</p>
          <h1 className="truncate font-display text-xl font-medium tracking-tight">Ancient Forest</h1>
        </div>
        <button
          type="button"
          aria-pressed={placing}
          onClick={() => setPlacing(!placing)}
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium active:opacity-80",
            placing ? "bg-raised text-fg" : "bg-accent text-accent-fg",
          )}
        >
          <MapPin className="size-4" />
          {placing ? "Cancel" : "Place pin"}
        </button>
      </header>
      <div className="atlas-body">
        <CodexPanel open={sheetOpen} onToggle={() => setSheetOpen((value) => !value)} />
        <MapStage />
      </div>
    </div>
  );
}
