// @ts-nocheck
import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlotCtx } from "@/contexts/PlotContext";

export function PlotSelector() {
  const { plotId, plots, setPlotId } = usePlotCtx();
  return (
    <Select value={plotId} onValueChange={setPlotId}>
      <SelectTrigger className="h-11 w-full rounded-xl bg-card" aria-label="Current plot">
        <MapPin className="size-4 text-primary" />
        <SelectValue placeholder={plots.length ? "Select plot" : "No plots yet"} />
      </SelectTrigger>
      <SelectContent>
        {plots.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name} · <span className="capitalize text-muted-foreground">{p.crop}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
