import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Bell, FlaskConical, Leaf, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { moreNav, MoreIcon, primaryNav } from "./nav";
import { PlotSelector } from "./PlotSelector";
import { usePlotCtx } from "@/contexts/PlotContext";
import { useAlerts } from "@/hooks/queries";
import { DEMO_MODE } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Leaf className="size-4.5" />
      </span>
      <span className="text-lg">AgroSense</span>
    </Link>
  );
}

function SocketPill() {
  const { socket } = usePlotCtx();
  if (socket === "demo")
    return (
      <span className="hidden items-center gap-1 rounded-full bg-warning/20 px-2 py-1 text-[11px] font-bold uppercase text-warning-foreground sm:inline-flex">
        <FlaskConical className="size-3" /> Demo mode
      </span>
    );
  const ok = socket === "open";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold", ok ? "bg-success/15 text-success-foreground" : "bg-warning/20 text-warning-foreground")}>
      {ok ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
      {ok ? "Live" : socket === "connecting" ? "Connecting" : "Reconnecting"}
    </span>
  );
}

function AlertBell() {
  const { data } = useAlerts();
  const n = data?.filter((a) => !a.resolved).length ?? 0;
  return (
    <Link to="/alerts" aria-label={`Alerts, ${n} open`} className="relative grid size-10 place-items-center rounded-xl hover:bg-muted">
      <Bell className="size-5" />
      {n > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{n}</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const auth = useAuth();
  const navigate = useNavigate();
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  const moreActive = path === "/more" || moreNav.some((n) => path.startsWith(n.to));

  useEffect(() => {
    if (auth.enabled && auth.ready && !auth.session) navigate({ to: "/login", replace: true });
  }, [auth, navigate]);

  return (
    <div className="min-h-screen">
      {DEMO_MODE && (
        <div className="bg-warning/20 px-4 py-1.5 text-center text-xs font-medium text-warning-foreground">
          <FlaskConical className="mr-1 inline size-3.5" />
          DEMO MODE — no backend connected. All readings shown are simulated, not from hardware.
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex" style={{ top: DEMO_MODE ? 28 : 0 }}>
        <div className="flex h-16 items-center px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
          {[...primaryNav, ...moreNav].map((n, i) => (
            <div key={n.to}>
              {i === primaryNav.length && <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Manage</p>}
              <Link
                to={n.to}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", isActive(n.to) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
              >
                <n.icon className="size-4.5" />
                {n.label}
              </Link>
            </div>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4 md:h-16 md:px-6">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:flex-1">
              <div className="hidden w-64 md:block">
                <PlotSelector />
              </div>
            </div>
            <SocketPill />
            <AlertBell />
            <Link to="/profile" className="hidden size-9 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground md:grid" aria-label="Profile">
              {auth.session?.user.email?.[0]?.toUpperCase() ?? "F"}
            </Link>
          </div>
          <div className="px-4 pb-2.5 md:hidden">
            <PlotSelector />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-4 pb-safe md:px-6 md:py-6 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5">
          {[...primaryNav, { to: "/more", label: "More", icon: MoreIcon }].map((n) => {
            const active = n.to === "/more" ? moreActive : isActive(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-accent")}>
                  <n.icon className="size-5" />
                </span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
