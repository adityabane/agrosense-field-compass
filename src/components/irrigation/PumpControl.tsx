// @ts-nocheck
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, OctagonX, Play, Power, ShieldAlert, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EstimatedTag, Panel, StaleWarning } from "@/components/ui/agro";
import { Skeleton } from "@/components/ui/skeleton";
import { useDecision, useDevices, usePump, usePumpCommand } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { formatLiters, timeAgo } from "@/utils/agronomy";
import type { CommandStatus } from "@/types";

const cmdMeta: Record<CommandStatus, { label: string; icon: typeof Clock; cls: string }> = {
  pending: { label: "Pending — sent to server", icon: Clock, cls: "bg-muted text-muted-foreground" },
  acknowledged: { label: "Acknowledged by device", icon: Loader2, cls: "bg-info/10 text-info" },
  executing: { label: "Executing", icon: Loader2, cls: "bg-accent text-accent-foreground" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-success/15 text-success-foreground" },
  failed: { label: "Failed", icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  expired: { label: "Expired — device did not respond", icon: XCircle, cls: "bg-destructive/10 text-destructive" },
};

export function PumpControl({ plotId }: { plotId: string }) {
  const { data: pump, isLoading } = usePump(plotId);
  const { data: devices } = useDevices();
  const { data: decision } = useDecision(plotId);
  const cmd = usePumpCommand(plotId);
  const [confirm, setConfirm] = useState(false);

  if (isLoading || !pump) return <Skeleton className="h-72 rounded-2xl" />;

  const device = devices?.find((d) => d.plotId === plotId);
  const online = !!device?.online;
  const inFlight = pump.command && ["pending", "acknowledged"].includes(pump.command.status);
  const on = pump.confirmedOn;

  const send = (a: "start" | "stop" | "emergency_stop") =>
    cmd.mutate(a, { onError: (e) => toast.error(`Command failed: ${e instanceof Error ? e.message : "unknown error"}`), onSuccess: () => toast.message(a === "emergency_stop" ? "Emergency stop sent" : `${a === "start" ? "Start" : "Stop"} command sent — waiting for device confirmation`) });

  const CI = pump.command ? cmdMeta[pump.command.status] : null;

  return (
    <Panel
      title="Pump control"
      icon={<Power className="size-4 text-primary" />}
      action={<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase text-muted-foreground">{pump.mode === "auto" ? "Automatic" : "Manual"} mode</span>}
    >
      <div className="flex items-center gap-4">
        <div className={cn("grid size-20 shrink-0 place-items-center rounded-full border-4", on ? "border-secondary bg-accent" : "border-border bg-muted")}>
          <Power className={cn("size-8", on ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Confirmed pump status</p>
          <p className={cn("text-3xl font-extrabold", on ? "text-primary" : "text-foreground")}>{on ? "ON" : "OFF"}</p>
          <p className="text-xs text-muted-foreground">
            Device {device ? `${device.name} · ${online ? "online" : "offline"} · ${timeAgo(device.lastHeartbeat)}` : "not assigned"}
          </p>
        </div>
      </div>

      {CI && pump.command && (
        <div className={cn("mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium", CI.cls)} role="status">
          <CI.icon className={cn("size-4", ["acknowledged", "executing"].includes(pump.command.status) && "animate-spin")} />
          <span className="capitalize">{pump.command.action.replace("_", " ")}:</span> {CI.label}
        </div>
      )}

      {on && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Session progress</span>
            <span className="tabular">{pump.progress}%</span>
          </div>
          <Progress value={pump.progress} />
          <div className="grid grid-cols-3 gap-2 pt-1 text-sm">
            <div><p className="text-xs text-muted-foreground">Delivered</p><p className="font-semibold">{formatLiters(pump.deliveredL)}</p></div>
            <div><p className="text-xs text-muted-foreground">Remaining</p><p className="font-semibold">{formatLiters(pump.remainingL)}</p></div>
            <div><p className="text-xs text-muted-foreground">Runtime</p><p className="font-semibold tabular">{Math.floor(pump.runtimeSec / 60)}m {pump.runtimeSec % 60}s</p></div>
          </div>
          <EstimatedTag />
        </div>
      )}

      {!online && <div className="mt-4"><StaleWarning text="Device offline — remote start is disabled for safety." /></div>}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button size="lg" className="h-14 rounded-xl text-base" disabled={!online || on || !!inFlight || cmd.isPending} onClick={() => setConfirm(true)}>
          <Play className="size-5" /> Start pump
        </Button>
        <Button size="lg" variant="outline" className="h-14 rounded-xl text-base" disabled={!on || !!inFlight || cmd.isPending} onClick={() => send("stop")}>
          <Square className="size-5" /> Stop pump
        </Button>
        <Button size="lg" variant="destructive" className="col-span-2 h-14 rounded-xl text-base font-bold uppercase tracking-wide" onClick={() => send("emergency_stop")}>
          <OctagonX className="size-5" /> Emergency stop
        </Button>
      </div>

      <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
        <li className="flex gap-1.5"><ShieldAlert className="size-3.5 shrink-0" /> Pump status changes only after the ESP32 confirms the command.</li>
        <li className="flex gap-1.5"><ShieldAlert className="size-3.5 shrink-0" /> Max runtime and minimum off-time from Automation Settings are enforced by the server.</li>
      </ul>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start the pump?</AlertDialogTitle>
            <AlertDialogDescription>
              {decision?.shouldIrrigate
                ? `Recommended: about ${formatLiters(decision.waterL)} over ${decision.runtimeMin} minutes (estimated).`
                : "The rule-based engine currently says irrigation is not needed. Make sure water is available before starting."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction className="h-11" onClick={() => send("start")}>Start pump</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Panel>
  );
}
