// @ts-nocheck
import { EmptyState, EstimatedTag, PageHeader, Panel } from "@/components/ui/agro";
import { PumpControl } from "@/components/irrigation/PumpControl";
import { DecisionCard } from "@/components/irrigation/DecisionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlotCtx } from "@/contexts/PlotContext";
import { useSessions } from "@/hooks/queries";
import { formatLiters } from "@/utils/agronomy";

export function IrrigationPage() {
  const { plotId, plot } = usePlotCtx();
  const { data: sessions } = useSessions(plotId);
  if (!plotId) return <EmptyState title="Select a plot" description="Choose a plot to control its pump." />;
  return (
    <>
      <PageHeader title="Irrigation control" subtitle={plot?.name} />
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3"><PumpControl plotId={plotId} /></div>
        <div className="space-y-4 lg:col-span-2">
          <DecisionCard plotId={plotId} />
          <Panel title="Recent sessions" action={<EstimatedTag />}>
            {!sessions ? <Skeleton className="h-32" /> : (
              <ul className="divide-y text-sm">
                {sessions.items.slice(-6).reverse().map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2">
                    <span>{new Date(s.startedAt).toLocaleDateString([], { day: "numeric", month: "short" })} · <span className="capitalize text-muted-foreground">{s.status}</span></span>
                    <span className="tabular text-muted-foreground">{s.durationMin}m · {formatLiters(s.waterL)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
