import type { ReactNode } from "react";
import { AlertTriangle, CloudOff, FlaskConical, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Level } from "@/types";

export function Panel({ title, action, children, className, icon }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border bg-card p-4 shadow-card md:p-5", className)}>
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {icon}
            {title}
          </h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, icon, tone = "default" }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: "default" | "warning" | "critical" | "good" }) {
  const toneCls = { default: "bg-accent text-accent-foreground", warning: "bg-warning/15 text-warning-foreground", critical: "bg-destructive/10 text-destructive", good: "bg-success/15 text-success-foreground" }[tone];
  return (
    <div className="rounded-2xl border bg-card p-3.5 shadow-card md:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {icon && <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", toneCls)}>{icon}</span>}
      </div>
      <p className="mt-1 text-xl font-bold tabular md:text-2xl">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const levelCls: Record<Level, string> = {
  normal: "bg-success/15 text-success-foreground",
  warning: "bg-warning/20 text-warning-foreground",
  critical: "bg-destructive/10 text-destructive",
  unknown: "bg-muted text-muted-foreground",
};
export function LevelBadge({ level, children }: { level: Level; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", levelCls[level])}>
      <span className="size-1.5 rounded-full bg-current" />
      {children ?? level}
    </span>
  );
}

export function Tag({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "warning" | "info" | "primary" }) {
  const t = { muted: "bg-muted text-muted-foreground", warning: "bg-warning/20 text-warning-foreground", info: "bg-info/10 text-info", primary: "bg-accent text-accent-foreground" }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", t)}>{children}</span>;
}

export const SimulatedTag = () => (
  <Tag tone="warning">
    <FlaskConical className="size-3" /> Simulated
  </Tag>
);
export const EstimatedTag = () => <Tag tone="info">Estimated</Tag>;
export const RuleBasedTag = () => <Tag tone="primary">Rule-based</Tag>;

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-10 text-center">
      <Inbox className="size-8 text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof Error ? error.message : "Unable to reach the AgroSense server.";
  return (
    <div className="flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
      <CloudOff className="size-7 text-destructive" />
      <p className="mt-2 font-semibold">Couldn't load data</p>
      <p className="mt-1 text-sm text-muted-foreground">{msg}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-4" /> Retry
        </Button>
      )}
    </div>
  );
}

export function StaleWarning({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 rounded-lg bg-warning/15 px-2.5 py-1.5 text-xs font-medium text-warning-foreground">
      <AlertTriangle className="size-3.5 shrink-0" /> {text}
    </p>
  );
}

export function CardsSkeleton({ n = 4, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}
