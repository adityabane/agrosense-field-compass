import { useState } from "react";
import { CalendarClock, CheckCircle2, Clock, PauseCircle, XCircle } from "lucide-react";
import { EmptyState, EstimatedTag, PageHeader, Panel, RuleBasedTag } from "@/components/ui/agro";
import { DecisionCard } from "@/components/irrigation/DecisionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlotCtx } from "@/contexts/PlotContext";
import { useSchedule } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { formatLiters } from "@/utils/agronomy";
import type { IrrigationSession } from "@/types";

const meta = {
  completed: { icon: CheckCircle2, cls: "text-success-foreground bg-success/15" },
  upcoming: { icon: Clock, cls: "text-info bg-info/10" },
  postponed: { icon: PauseCircle, cls: "text-warning-foreground bg-warning/20" },
  missed: { icon: XCircle, cls: "text-destructive bg-destructive/10" },
};

export function SchedulePage() {
  const { plotId, plot } = usePlotCtx();
  const { data, isLoading } = useSchedule(plotId);
  const [sel, setSel] = useState<IrrigationSession | null>(null);
  const sorted = [...(data ?? [])].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return (
    <>
      <PageHeader title="Irrigation schedule" subtitle={<span className="inline-flex items-center gap-2">{plot?.name} · recommendations are <RuleBasedTag /></span>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1"><DecisionCard plotId={plotId} /></div>
        <Panel title="Timeline" icon={<CalendarClock className="size-4 text-primary" />} className="lg:col-span-2" action={<EstimatedTag />}>
          {isLoading ? <Skeleton className="h-64" /> : !sorted.length ? <EmptyState title="No sessions" /> : (
            <ol className="relative space-y-1 border-l pl-5">
              {sorted.map((s) => {
                const M = meta[s.status];
                return (
                  <li key={s.id}>
                    <button onClick={() => setSel(s)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-muted">
                      <span className={cn("-ml-[33px] grid size-7 place-items-center rounded-full", M.cls)}><M.icon className="size-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{new Date(s.startedAt).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="block text-xs capitalize text-muted-foreground">{s.status}</span>
                      </span>
                      <span className="text-right text-xs tabular text-muted-foreground">{s.durationMin} min<br />{formatLiters(s.waterL)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Session details</DialogTitle></DialogHeader>
          {sel && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Date</dt><dd className="font-semibold">{new Date(sel.startedAt).toLocaleString()}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd className="font-semibold capitalize">{sel.status}</dd></div>
              <div><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold">{sel.durationMin} min</dd></div>
              <div><dt className="text-muted-foreground">Water</dt><dd className="font-semibold">{formatLiters(sel.waterL)} <EstimatedTag /></dd></div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
