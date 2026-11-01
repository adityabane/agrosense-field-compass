import { CloudRain, Droplet, Thermometer, Wind } from "lucide-react";
import { LevelBadge, SimulatedTag, StaleWarning } from "@/components/ui/agro";
import { TimeChart } from "@/components/charts/TimeChart";
import type { SensorHistoryPoint, SensorReading } from "@/types";
import { isStale, timeAgo } from "@/utils/agronomy";

export const sensorMeta = {
  soil_moisture: { label: "Soil moisture", icon: Droplet, color: "var(--chart-1)" },
  temperature: { label: "Temperature", icon: Thermometer, color: "var(--chart-4)" },
  humidity: { label: "Air humidity", icon: Wind, color: "var(--chart-3)" },
  rainfall: { label: "Rainfall", icon: CloudRain, color: "var(--chart-5)" },
} as const;

export function SensorCard({ reading, history }: { reading: SensorReading; history?: SensorHistoryPoint[] }) {
  const m = sensorMeta[reading.key];
  const stale = isStale(reading.recordedAt);
  return (
    <article className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <m.icon className="size-4.5" />
          </span>
          <p className="text-sm font-semibold">{m.label}</p>
        </div>
        <LevelBadge level={stale ? "unknown" : reading.level}>{stale ? "Stale" : undefined}</LevelBadge>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular">{reading.value ?? "—"}</span>
        <span className="text-sm text-muted-foreground">{reading.unit}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>Threshold: {reading.threshold}</span>
        <span>Updated {timeAgo(reading.recordedAt)}</span>
        {reading.source === "simulated" && <SimulatedTag />}
      </div>
      {stale && <div className="mt-2"><StaleWarning text={`No new reading since ${reading.recordedAt ? new Date(reading.recordedAt).toLocaleString() : "—"}`} /></div>}
      {history && history.length > 0 && (
        <div className="mt-3">
          <TimeChart data={history} dataKey={reading.key} unit={reading.unit} color={m.color} height={120} />
        </div>
      )}
    </article>
  );
}
