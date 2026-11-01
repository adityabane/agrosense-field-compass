import { useState } from "react";
import { Cpu, Signal } from "lucide-react";
import { CardsSkeleton, EmptyState, ErrorState, LevelBadge, PageHeader, Panel } from "@/components/ui/agro";
import { SensorCard } from "@/components/sensors/SensorCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevices, useHistory, useLatest } from "@/hooks/queries";
import { usePlotCtx } from "@/contexts/PlotContext";
import { timeAgo } from "@/utils/agronomy";

export function MonitoringPage() {
  const { plotId, plot } = usePlotCtx();
  const [hours, setHours] = useState(24);
  const latest = useLatest(plotId);
  const history = useHistory(plotId, hours);
  const { data: devices } = useDevices();
  const dev = devices?.find((d) => d.plotId === plotId);

  return (
    <>
      <PageHeader
        title="Live monitoring"
        subtitle={plot ? `${plot.name} — updates arrive in real time` : undefined}
        action={
          <Tabs value={String(hours)} onValueChange={(v) => setHours(+v)}>
            <TabsList>
              <TabsTrigger value="6">6h</TabsTrigger>
              <TabsTrigger value="24">24h</TabsTrigger>
              <TabsTrigger value="72">3d</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <Panel title="ESP32 device" icon={<Cpu className="size-4 text-primary" />} className="mb-4">
        {dev ? (
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Status</p><LevelBadge level={dev.online ? "normal" : "critical"}>{dev.online ? "Online" : "Offline"}</LevelBadge></div>
            <div><p className="text-xs text-muted-foreground">Last heartbeat</p><p className="font-semibold">{timeAgo(dev.lastHeartbeat)}</p></div>
            <div><p className="text-xs text-muted-foreground">Wi-Fi signal</p><p className="flex items-center gap-1 font-semibold"><Signal className="size-3.5" />{dev.rssi} dBm</p></div>
            <div><p className="text-xs text-muted-foreground">Firmware</p><p className="font-mono font-semibold">v{dev.firmware}</p></div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No device is assigned to this plot.</p>
        )}
      </Panel>

      {latest.error ? (
        <ErrorState error={latest.error} onRetry={() => latest.refetch()} />
      ) : latest.isLoading ? (
        <CardsSkeleton n={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2" />
      ) : !latest.data?.length ? (
        <EmptyState title="No sensor data" description="This plot has no device or has not reported any readings yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {latest.data.map((r) => <SensorCard key={r.key} reading={r} history={history.data?.items} />)}
        </div>
      )}
    </>
  );
}
