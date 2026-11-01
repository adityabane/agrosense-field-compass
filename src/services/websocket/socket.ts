import { API_BASE_URL, DEMO_MODE } from "@/services/api/client";
import { getAccessToken } from "@/services/auth/auth";
import { onDemoEvent } from "./demoBus";
import type { SocketEvent } from "@/types";

export type SocketStatus = "connecting" | "open" | "closed" | "demo";

/**
 * Connects to the FastAPI WebSocket for a plot and reconnects with
 * exponential backoff. In demo mode it listens to the simulated event bus.
 */
export function connectPlotSocket(
  plotId: string,
  onEvent: (e: SocketEvent) => void,
  onStatus: (s: SocketStatus) => void,
) {
  if (DEMO_MODE) {
    onStatus("demo");
    const off = onDemoEvent((e) => (!("plotId" in e) || e.plotId === plotId || e.plotId === null) && onEvent(e));
    const iv = setInterval(() => onEvent({ type: "sensor.updated", plotId }), 15000);
    return () => {
      off();
      clearInterval(iv);
    };
  }

  let ws: WebSocket | null = null;
  let attempts = 0;
  let closed = false;
  let timer: ReturnType<typeof setTimeout>;

  const open = async () => {
    onStatus("connecting");
    const token = await getAccessToken();
    const base = API_BASE_URL.replace(/^http/, "ws");
    ws = new WebSocket(`${base}/api/v1/ws?plot_id=${encodeURIComponent(plotId)}${token ? `&token=${token}` : ""}`);
    ws.onopen = () => {
      attempts = 0;
      onStatus("open");
    };
    ws.onmessage = (m) => {
      try {
        onEvent(JSON.parse(m.data));
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onclose = () => {
      onStatus("closed");
      if (closed) return;
      const wait = Math.min(30000, 1000 * 2 ** attempts++);
      timer = setTimeout(open, wait);
    };
    ws.onerror = () => ws?.close();
  };
  open();

  return () => {
    closed = true;
    clearTimeout(timer);
    ws?.close();
  };
}
