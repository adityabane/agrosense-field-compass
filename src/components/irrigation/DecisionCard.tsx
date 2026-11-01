// @ts-nocheck
import { Lightbulb } from "lucide-react";
import { Panel, RuleBasedTag, LevelBadge } from "@/components/ui/agro";
import { Skeleton } from "@/components/ui/skeleton";
import { useDecision } from "@/hooks/queries";
import { formatLiters } from "@/utils/agronomy";

export function DecisionCard({ plotId }: { plotId?: string }) {
  const { data: d, isLoading } = useDecision(plotId);
  return (
    <Panel title="Irrigation recommendation" icon={<Lightbulb className="size-4 text-primary" />} action={<RuleBasedTag />}>
      {isLoading || !d ? (
        <Skeleton className="h-20" />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{d.shouldIrrigate ? "Irrigate soon" : "No irrigation needed"}</p>
            <LevelBadge level={d.priority === "high" ? "critical" : d.priority === "medium" ? "warning" : "normal"}>{d.priority} priority</LevelBadge>
          </div>
          <p className="text-sm text-muted-foreground">{d.reason}</p>
          {d.shouldIrrigate && (
            <dl className="grid grid-cols-3 gap-2 pt-1 text-sm">
              <div><dt className="text-xs text-muted-foreground">When</dt><dd className="font-semibold">{new Date(d.recommendedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Water (est.)</dt><dd className="font-semibold">{formatLiters(d.waterL)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Runtime</dt><dd className="font-semibold">{d.runtimeMin} min</dd></div>
            </dl>
          )}
        </div>
      )}
    </Panel>
  );
}
