// @ts-nocheck
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarClock, CloudSun, Droplets, Map, Power, Ruler, Sprout } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CardsSkeleton, EmptyState, ErrorState, EstimatedTag, LevelBadge, PageHeader, Panel, SimulatedTag, Stat } from "@/components/ui/agro";
import { DecisionCard } from "@/components/irrigation/DecisionCard";
import { axisTick, tooltipStyle } from "@/components/charts/TimeChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useDevices, useLatest, useOverview, usePump, useSchedule, useWater } from "@/hooks/queries";
import { usePlotCtx } from "@/contexts/PlotContext";
import { formatLiters, timeAgo, unitLabel } from "@/utils/agronomy";
import type { Plot } from "@/types";

function PlotRow({ plot }: { plot: Plot }) {
  const { data: r } = useLatest(plot.id);
  const { data: pump } = usePump(plot.id);
  const { data: devices } = useDevices();
  const dev = devices?.find((d) => d.plotId === plot.id);
  const val = (k: string) => r?.find((x) => x.key === k);
  const m = val("soil_moisture");
  return (
    <Link to="/plots/$id" params={{ id: plot.id }} className="block rounded-xl border bg-card p-3.5 transition-colors hover:bg-surface">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{plot.name}</p>
          <p className="text-xs capitalize text-muted-foreground">{plot.crop} · {plot.area} {unitLabel[plot.areaUnit]}</p>
        </div>
        <LevelBadge level={dev?.online ? "normal" : "critical"}>{dev ? (dev.online ? "Online" : "Offline") : "No device"}</LevelBadge>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[["Moisture", m ? `${m.value}%` : "—"], ["Temp", val("temperature") ? `${val("temperature")!.value}°` : "—"], ["Humidity", val("humidity") ? `${val("humidity")!.value}%` : "—"], ["Pump", pump?.confirmedOn ? "ON" : "OFF"]].map(([l, v]) => (
          <div key={l} className="rounded-lg bg-surface py-1.5">
            <p className="text-[10px] text-muted-foreground">{l}</p>
            <p className="text-sm font-bold tabular">{v}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}

export function OverviewPage() {
  const { data: o, isLoading, error, refetch } = useOverview();
  const { plots, plotId } = usePlotCtx();
  const { data: water } = useWater("all", 7);
  const { data: alerts } = useAlerts();
  const { data: sched } = useSchedule(plotId);
  const upcoming = sched?.filter((s) => s.status === "upcoming").slice(0, 3) ?? [];

  return (
    <>
      <PageHeader title="Good day, farmer" subtitle="Here's what's happening across your fields." />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading || !o ? (
        <CardsSkeleton n={6} className="lg:grid-cols-6" />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total plots" value={o.totalPlots} icon={<Map className="size-4" />} />
          <Stat label="Total area" value={`${o.totalAreaAcres} ac`} icon={<Ruler className="size-4" />} />
          <Stat label="Pumps running" value={o.activeIrrigation} icon={<Power className="size-4" />} tone="good" />
          <Stat label="Need irrigation" value={o.plotsNeedingIrrigation} icon={<AlertTriangle className="size-4" />} tone={o.plotsNeedingIrrigation ? "warning" : "default"} />
          <Stat label="Water today" value={formatLiters(o.todayWaterL)} hint={<EstimatedTag />} icon={<Droplets className="size-4" />} />
          <Stat label="Upcoming sessions" value={o.upcomingSessions} icon={<CalendarClock className="size-4" />} />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Your plots" action={<Link to="/plots" className="text-xs font-semibold text-primary">Manage</Link>}>
            {plots.length === 0 ? (
              <EmptyState title="No plots yet" description="Add your first plot to start monitoring." action={<Link to="/plots" className="font-semibold text-primary">Add plot</Link>} />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">{plots.map((p) => <PlotRow key={p.id} plot={p} />)}</div>
            )}
          </Panel>

          <Panel title="Water consumption · last 7 days" action={<EstimatedTag />}>
            {!water ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart data={water.daily} margin={{ left: -16, right: 4 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={axisTick} tickLine={false} axisLine={false} />
                    <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} L (est.)`, "Water"]} />
                    <Bar dataKey="actual" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <DecisionCard plotId={plotId} />
          {o?.weather && (
            <Panel title="Weather" icon={<CloudSun className="size-4 text-primary" />} action={<SimulatedTag />}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{o.weather.tempC}°C</p>
                  <p className="text-sm text-muted-foreground">{o.weather.condition}</p>
                </div>
                <div className="text-right text-sm">
                  <p>Rain chance <b>{o.weather.rainChancePct}%</b></p>
                  <p>Forecast <b>{o.weather.forecastMm} mm</b></p>
                </div>
              </div>
            </Panel>
          )}
          <Panel title="Upcoming irrigation" icon={<CalendarClock className="size-4 text-primary" />}>
            {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nothing scheduled.</p> : (
              <ul className="divide-y">
                {upcoming.map((s) => (
                  <li key={s.id} className="flex justify-between py-2 text-sm">
                    <span>{new Date(s.startedAt).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="text-muted-foreground">{s.durationMin} min · {formatLiters(s.waterL)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Recent alerts" icon={<Sprout className="size-4 text-primary" />} action={<Link to="/alerts" className="text-xs font-semibold text-primary">View all</Link>}>
            <ul className="space-y-2">
              {alerts?.filter((a) => !a.resolved).slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <LevelBadge level={a.severity === "critical" ? "critical" : a.severity === "warning" ? "warning" : "normal"}>{a.severity}</LevelBadge>
                  <span className="min-w-0 flex-1">{a.title}<span className="block text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span></span>
                </li>
              )) ?? <Skeleton className="h-16" />}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
