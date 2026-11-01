import type { SocketEvent } from "@/types";

type Listener = (e: SocketEvent) => void;
const listeners = new Set<Listener>();

export function emitDemoEvent(e: SocketEvent) {
  listeners.forEach((l) => l(e));
}
export function onDemoEvent(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
