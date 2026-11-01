import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePlots, qk } from "@/hooks/queries";
import { connectPlotSocket, type SocketStatus } from "@/services/websocket/socket";
import type { Plot } from "@/types";

interface Ctx {
  plotId: string | undefined;
  plot: Plot | undefined;
  plots: Plot[];
  setPlotId: (id: string) => void;
  socket: SocketStatus;
}
const PlotCtx = createContext<Ctx | null>(null);
const KEY = "agrosense.plot";

export function PlotProvider({ children }: { children: ReactNode }) {
  const { data } = usePlots();
  const plots = (data ?? []).filter((p) => p.active);
  const [plotId, setPlotIdState] = useState<string>();
  const [socket, setSocket] = useState<SocketStatus>("connecting");
  const qc = useQueryClient();

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setPlotIdState(saved);
  }, []);
  useEffect(() => {
    if (plots.length && (!plotId || !plots.some((p) => p.id === plotId))) setPlotIdState(plots[0].id);
  }, [plots, plotId]);

  useEffect(() => {
    if (!plotId) return;
    return connectPlotSocket(
      plotId,
      (e) => {
        switch (e.type) {
          case "sensor.updated":
            qc.invalidateQueries({ queryKey: qk.latest(plotId) });
            break;
          case "device.status_changed":
            qc.invalidateQueries({ queryKey: qk.devices });
            qc.invalidateQueries({ queryKey: qk.latest(plotId) });
            break;
          case "pump.status_changed":
          case "pump.command_updated":
            qc.invalidateQueries({ queryKey: qk.pump(plotId) });
            qc.invalidateQueries({ queryKey: qk.overview });
            break;
          case "alert.created":
            qc.invalidateQueries({ queryKey: qk.alerts });
            break;
          case "irrigation.decision_updated":
            qc.invalidateQueries({ queryKey: qk.decision(plotId) });
            break;
        }
      },
      setSocket,
    );
  }, [plotId, qc]);

  const setPlotId = (id: string) => {
    localStorage.setItem(KEY, id);
    setPlotIdState(id);
  };

  return <PlotCtx.Provider value={{ plotId, plot: plots.find((p) => p.id === plotId), plots, setPlotId, socket }}>{children}</PlotCtx.Provider>;
}

export function usePlotCtx() {
  const c = useContext(PlotCtx);
  if (!c) throw new Error("usePlotCtx outside PlotProvider");
  return c;
}
