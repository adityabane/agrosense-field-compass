import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertApi, analyticsApi, dashboardApi, deviceApi, irrigationApi, plotApi, scheduleApi, sensorApi } from "@/services/api";
import type { IrrigationSettings, Plot, PlotInput } from "@/types";

export const qk = {
  overview: ["overview"] as const,
  plots: ["plots"] as const,
  plot: (id: string) => ["plot", id] as const,
  latest: (id: string) => ["sensors", "latest", id] as const,
  history: (id: string, h: number) => ["sensors", "history", id, h] as const,
  settings: (id: string) => ["irrigation", "settings", id] as const,
  decision: (id: string) => ["irrigation", "decision", id] as const,
  pump: (id: string) => ["irrigation", "pump", id] as const,
  sessions: (id: string) => ["irrigation", "sessions", id] as const,
  schedule: (id: string) => ["schedule", id] as const,
  water: (id: string, d: number) => ["analytics", "water", id, d] as const,
  alerts: ["alerts"] as const,
  devices: ["devices"] as const,
};

export const plotsQuery = queryOptions({ queryKey: qk.plots, queryFn: plotApi.list, staleTime: 60_000 });

export const useOverview = () => useQuery({ queryKey: qk.overview, queryFn: dashboardApi.overview, staleTime: 30_000 });
export const usePlots = () => useQuery(plotsQuery);
export const usePlot = (id: string) => useQuery({ queryKey: qk.plot(id), queryFn: () => plotApi.get(id), enabled: !!id });
export const useLatest = (id?: string) =>
  useQuery({ queryKey: qk.latest(id ?? ""), queryFn: () => sensorApi.latest(id!), enabled: !!id, refetchInterval: 60_000 });
// History is expensive: cache for 5 minutes, don't refetch on focus.
export const useHistory = (id: string | undefined, hours: number) =>
  useQuery({ queryKey: qk.history(id ?? "", hours), queryFn: () => sensorApi.history(id!, hours), enabled: !!id, staleTime: 5 * 60_000, refetchOnWindowFocus: false });
export const useSettings = (id?: string) => useQuery({ queryKey: qk.settings(id ?? ""), queryFn: () => irrigationApi.settings(id!), enabled: !!id });
export const useDecision = (id?: string) => useQuery({ queryKey: qk.decision(id ?? ""), queryFn: () => irrigationApi.decision(id!), enabled: !!id });
export const usePump = (id?: string) => useQuery({ queryKey: qk.pump(id ?? ""), queryFn: () => irrigationApi.pump(id!), enabled: !!id });
export const useSessions = (id?: string) =>
  useQuery({ queryKey: qk.sessions(id ?? ""), queryFn: () => irrigationApi.sessions(id!), enabled: !!id, staleTime: 5 * 60_000 });
export const useSchedule = (id?: string) => useQuery({ queryKey: qk.schedule(id ?? ""), queryFn: () => scheduleApi.list(id!), enabled: !!id });
export const useWater = (id: string | undefined, days: number) =>
  useQuery({ queryKey: qk.water(id ?? "", days), queryFn: () => analyticsApi.water(id!, days), enabled: !!id, staleTime: 5 * 60_000 });
export const useAlerts = () => useQuery({ queryKey: qk.alerts, queryFn: alertApi.list });
export const useDevices = () => useQuery({ queryKey: qk.devices, queryFn: deviceApi.list, refetchInterval: 60_000 });

export function useCreatePlot() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (i: PlotInput) => plotApi.create(i), onSuccess: () => qc.invalidateQueries() });
}
export function useUpdatePlot() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, patch }: { id: string; patch: Partial<Plot> }) => plotApi.update(id, patch), onSuccess: () => qc.invalidateQueries() });
}
export function useSaveSettings(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: IrrigationSettings) => irrigationApi.saveSettings(id, s),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.settings(id) });
      qc.invalidateQueries({ queryKey: qk.decision(id) });
      qc.invalidateQueries({ queryKey: qk.pump(id) });
    },
  });
}
export function usePumpCommand(id: string) {
  const qc = useQueryClient();
  // Not optimistic: pump state only changes when the device confirms via the backend.
  return useMutation({
    mutationFn: (action: "start" | "stop" | "emergency_stop") =>
      action === "start" ? irrigationApi.start(id) : action === "stop" ? irrigationApi.stop(id) : irrigationApi.emergencyStop(id),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.pump(id) }),
  });
}
export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: alertApi.resolve, onSuccess: () => qc.invalidateQueries({ queryKey: qk.alerts }) });
}
export function useAssignDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ deviceId, plotId }: { deviceId: string; plotId: string | null }) => deviceApi.assign(deviceId, plotId), onSuccess: () => qc.invalidateQueries() });
}
