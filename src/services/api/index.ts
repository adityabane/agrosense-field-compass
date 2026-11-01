import { DEMO_MODE, delay, http } from "./client";
import { demo } from "@/services/demo/demoStore";
import type {
  Alert,
  Device,
  IrrigationDecision,
  IrrigationSession,
  IrrigationSettings,
  Overview,
  Paginated,
  Plot,
  PlotInput,
  PumpState,
  SensorHistoryPoint,
  SensorReading,
  WaterAnalytics,
} from "@/types";
import { toAcres } from "@/utils/agronomy";

const get = async <T,>(url: string, params?: object) => (await http.get<T>(url, { params })).data;

export const dashboardApi = {
  overview: async (): Promise<Overview> => {
    if (!DEMO_MODE) return get("/dashboard/overview");
    const ps = demo.listPlots();
    return delay({
      totalPlots: ps.length,
      totalAreaAcres: +ps.reduce((a, p) => a + toAcres(p.area, p.areaUnit), 0).toFixed(1),
      activeIrrigation: ps.filter((p) => demo.pump(p.id).confirmedOn).length,
      plotsNeedingIrrigation: ps.filter((p) => demo.decision(p.id).shouldIrrigate).length,
      todayWaterL: demo.water("all").todayL,
      upcomingSessions: ps.length * 3,
      weather: { tempC: 30, condition: "Partly cloudy", rainChancePct: 35, forecastMm: 2.5 },
    });
  },
};

export const plotApi = {
  list: async (): Promise<Plot[]> => (DEMO_MODE ? delay(demo.allPlots()) : get("/plots")),
  get: async (id: string): Promise<Plot | null> => (DEMO_MODE ? delay(demo.getPlot(id)) : get(`/plots/${id}`)),
  create: async (input: PlotInput): Promise<Plot> => (DEMO_MODE ? delay(demo.createPlot(input)) : (await http.post("/plots", input)).data),
  update: async (id: string, patch: Partial<Plot>): Promise<Plot> =>
    DEMO_MODE ? delay(demo.updatePlot(id, patch)!) : (await http.patch(`/plots/${id}`, patch)).data,
};

export const cropApi = {
  updateStage: (id: string, growthStage: string) => plotApi.update(id, { growthStage }),
};

export const sensorApi = {
  latest: async (plotId: string): Promise<SensorReading[]> =>
    DEMO_MODE ? delay(demo.latest(plotId)) : get(`/plots/${plotId}/sensors/latest`),
  history: async (plotId: string, hours = 24, page = 1, pageSize = 500): Promise<Paginated<SensorHistoryPoint>> => {
    if (!DEMO_MODE) return get(`/plots/${plotId}/sensors/history`, { hours, page, page_size: pageSize });
    const items = demo.history(plotId, hours);
    return delay({ items, page, pageSize, total: items.length });
  },
};

export const irrigationApi = {
  settings: async (plotId: string): Promise<IrrigationSettings> =>
    DEMO_MODE ? delay(demo.getSettings(plotId)) : get(`/plots/${plotId}/irrigation/settings`),
  saveSettings: async (plotId: string, s: IrrigationSettings): Promise<IrrigationSettings> =>
    DEMO_MODE ? delay(demo.saveSettings(plotId, s)) : (await http.put(`/plots/${plotId}/irrigation/settings`, s)).data,
  decision: async (plotId: string): Promise<IrrigationDecision> =>
    DEMO_MODE ? delay(demo.decision(plotId)) : get(`/plots/${plotId}/irrigation/decision`),
  pump: async (plotId: string): Promise<PumpState> =>
    DEMO_MODE ? delay(demo.pump(plotId), 150) : get(`/plots/${plotId}/irrigation/pump`),
  start: async (plotId: string) => (DEMO_MODE ? delay(demo.sendCommand(plotId, "start")) : (await http.post(`/plots/${plotId}/irrigation/start`)).data),
  stop: async (plotId: string) => (DEMO_MODE ? delay(demo.sendCommand(plotId, "stop")) : (await http.post(`/plots/${plotId}/irrigation/stop`)).data),
  emergencyStop: async (plotId: string) =>
    DEMO_MODE ? delay(demo.sendCommand(plotId, "emergency_stop"), 50) : (await http.post(`/plots/${plotId}/irrigation/emergency-stop`)).data,
  sessions: async (plotId: string, page = 1): Promise<Paginated<IrrigationSession>> => {
    if (!DEMO_MODE) return get(`/plots/${plotId}/irrigation/sessions`, { page });
    const items = demo.sessions(plotId).filter((s) => s.status !== "upcoming");
    return delay({ items, page, pageSize: 50, total: items.length });
  },
};

export const scheduleApi = {
  list: async (plotId: string): Promise<IrrigationSession[]> => (DEMO_MODE ? delay(demo.sessions(plotId)) : get(`/plots/${plotId}/schedules`)),
};

export const analyticsApi = {
  water: async (plotId: string, days: number): Promise<WaterAnalytics> =>
    DEMO_MODE ? delay(demo.water(plotId, days)) : get(`/plots/${plotId}/analytics/water`, { days }),
};

export const alertApi = {
  list: async (): Promise<Alert[]> => (DEMO_MODE ? delay(demo.alerts()) : get("/alerts")),
  resolve: async (id: string) => (DEMO_MODE ? delay(demo.resolveAlert(id)) : (await http.post(`/alerts/${id}/resolve`)).data),
};

export const deviceApi = {
  list: async (): Promise<Device[]> => (DEMO_MODE ? delay(demo.devices()) : get("/devices")),
  assign: async (deviceId: string, plotId: string | null) =>
    DEMO_MODE ? delay(demo.assignDevice(deviceId, plotId)) : (await http.put(`/devices/${deviceId}/assignment`, { plot_id: plotId })).data,
};
