/**
 * DEMO MODE data store. Everything here is SIMULATED and is only used when
 * VITE_API_BASE_URL is not configured. It is never presented as hardware data.
 */
import type {
  Alert,
  Device,
  IrrigationDecision,
  IrrigationSession,
  IrrigationSettings,
  Plot,
  PlotInput,
  PumpState,
  SensorHistoryPoint,
  SensorReading,
  WaterAnalytics,
} from "@/types";
import { cropDefaults } from "@/utils/agronomy";
import { emitDemoEvent } from "@/services/websocket/demoBus";

const now = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
const H = 3600_000;

// Seeded pseudo-random for stable demo charts
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const plots: Plot[] = [
  { id: "p1", name: "North Field", area: 2.5, areaUnit: "acres", crop: "sugarcane", cropVariety: "Co 86032", soilType: "Black cotton", location: "Baramati, MH", irrigationMethod: "drip", sowingDate: "2026-02-10", growthStage: "Grand growth", active: true, deviceId: "esp32-a1" },
  { id: "p2", name: "River Plot", area: 1.2, areaUnit: "hectares", crop: "wheat", cropVariety: "HD 2967", soilType: "Alluvial loam", location: "Baramati, MH", irrigationMethod: "sprinkler", sowingDate: "2026-10-28", growthStage: "Crown root initiation", active: true, deviceId: "esp32-b2" },
  { id: "p3", name: "East Terrace", area: 1.8, areaUnit: "acres", crop: "sugarcane", cropVariety: "CoM 0265", soilType: "Red laterite", location: "Phaltan, MH", irrigationMethod: "flood", sowingDate: "2026-01-15", growthStage: "Tillering", active: true, deviceId: "esp32-c3" },
];

const devices: Device[] = [
  { id: "esp32-a1", name: "Node North", plotId: "p1", online: true, lastHeartbeat: iso(now() - 20_000), rssi: -58, firmware: "1.4.2", health: "good" },
  { id: "esp32-b2", name: "Node River", plotId: "p2", online: true, lastHeartbeat: iso(now() - 45_000), rssi: -71, firmware: "1.4.2", health: "degraded" },
  { id: "esp32-c3", name: "Node East", plotId: "p3", online: false, lastHeartbeat: iso(now() - 5 * H), rssi: -88, firmware: "1.3.9", health: "faulty" },
  { id: "esp32-d4", name: "Spare Node", plotId: null, online: true, lastHeartbeat: iso(now() - 60_000), rssi: -64, firmware: "1.4.2", health: "good" },
];

const settings: Record<string, IrrigationSettings> = {};
plots.forEach((p) => (settings[p.id] = { ...cropDefaults[p.crop] }));

const pumps: Record<string, PumpState> = {};
plots.forEach((p) => (pumps[p.id] = { plotId: p.id, confirmedOn: false, mode: "manual", sessionId: null, progress: 0, deliveredL: 0, remainingL: 0, runtimeSec: 0, command: null }));

const baseMoisture: Record<string, number> = { p1: 27, p2: 41, p3: 19 };

let alerts: Alert[] = [
  { id: "a1", plotId: "p3", type: "device_offline", severity: "critical", title: "Device offline", description: "Node East has not sent a heartbeat for 5 hours.", createdAt: iso(now() - 5 * H), resolved: false },
  { id: "a2", plotId: "p1", type: "irrigation_required", severity: "warning", title: "Irrigation required", description: "Soil moisture is below the configured minimum (30%).", createdAt: iso(now() - 1.2 * H), resolved: false },
  { id: "a3", plotId: "p2", type: "heavy_rain_forecast", severity: "info", title: "Rain forecast", description: "12 mm expected in the next 24 h. Irrigation may be postponed.", createdAt: iso(now() - 3 * H), resolved: false },
  { id: "a4", plotId: "p2", type: "abnormal_humidity", severity: "warning", title: "Abnormal humidity", description: "Air humidity reached 92% overnight.", createdAt: iso(now() - 20 * H), resolved: true },
];

function levelFor(v: number, s: IrrigationSettings): SensorReading["level"] {
  if (v <= s.criticalMoisture) return "critical";
  if (v < s.minMoisture) return "warning";
  return "normal";
}

export const demo = {
  listPlots: () => plots.filter((p) => p.active).map((p) => ({ ...p })),
  allPlots: () => plots.map((p) => ({ ...p })),
  getPlot: (id: string) => plots.find((p) => p.id === id) ?? null,
  createPlot(input: PlotInput): Plot {
    const p: Plot = { ...input, id: "p" + (plots.length + 1) + "-" + Math.random().toString(36).slice(2, 6), active: true, deviceId: null };
    plots.push(p);
    settings[p.id] = { ...cropDefaults[p.crop] };
    pumps[p.id] = { plotId: p.id, confirmedOn: false, mode: "manual", sessionId: null, progress: 0, deliveredL: 0, remainingL: 0, runtimeSec: 0, command: null };
    return p;
  },
  updatePlot(id: string, patch: Partial<Plot>) {
    const p = plots.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return p ? { ...p } : null;
  },

  latest(plotId: string): SensorReading[] {
    const p = plots.find((x) => x.id === plotId);
    const dev = devices.find((d) => d.id === p?.deviceId);
    const s = settings[plotId];
    if (!p || !dev) return [];
    const stale = !dev.online;
    const at = stale ? dev.lastHeartbeat : iso(now() - 15_000);
    const jitter = Math.sin(now() / 60000) * 0.8;
    const m = +(baseMoisture[plotId] ?? 35) + (pumps[plotId]?.confirmedOn ? pumps[plotId].progress * 0.15 : 0) + jitter;
    const t = 29.4 + jitter;
    const h = 63 + jitter * 2;
    return [
      { key: "soil_moisture", value: +m.toFixed(1), unit: "%", level: levelFor(m, s), threshold: `Min ${s.minMoisture}% · Target ${s.targetMoisture}%`, recordedAt: at, source: "simulated" },
      { key: "temperature", value: +t.toFixed(1), unit: "°C", level: t > s.tempMax || t < s.tempMin ? "warning" : "normal", threshold: `${s.tempMin}–${s.tempMax} °C`, recordedAt: at, source: "simulated" },
      { key: "humidity", value: +h.toFixed(0), unit: "%", level: h > s.humidityMax || h < s.humidityMin ? "warning" : "normal", threshold: `${s.humidityMin}–${s.humidityMax}%`, recordedAt: at, source: "simulated" },
      { key: "rainfall", value: 0, unit: "mm", level: "normal", threshold: `Skip if > ${s.rainfallThreshold} mm`, recordedAt: at, source: "simulated" },
    ];
  },

  history(plotId: string, hours = 24): SensorHistoryPoint[] {
    const r = rng(plotId.charCodeAt(1) * 31 + hours);
    const base = baseMoisture[plotId] ?? 35;
    const pts: SensorHistoryPoint[] = [];
    for (let i = hours; i >= 0; i--) {
      const hr = new Date(now() - i * H).getHours();
      pts.push({
        t: iso(now() - i * H),
        soil_moisture: +(base + 6 * Math.cos(i / 8) + r() * 2).toFixed(1),
        temperature: +(24 + 7 * Math.sin(((hr - 9) / 24) * Math.PI * 2) + r()).toFixed(1),
        humidity: +(65 - 15 * Math.sin(((hr - 9) / 24) * Math.PI * 2) + r() * 3).toFixed(0),
        rainfall: r() > 0.93 ? +(r() * 4).toFixed(1) : 0,
      });
    }
    return pts;
  },

  getSettings: (plotId: string) => ({ ...settings[plotId] }),
  saveSettings(plotId: string, s: IrrigationSettings) {
    settings[plotId] = { ...s };
    pumps[plotId].mode = s.autoMode ? "auto" : "manual";
    return { ...s };
  },

  decision(plotId: string): IrrigationDecision {
    const s = settings[plotId];
    const m = baseMoisture[plotId] ?? 35;
    const p = plots.find((x) => x.id === plotId)!;
    const deficit = Math.max(0, s.targetMoisture - m);
    const waterL = Math.round(deficit * 120 * (p?.area ?? 1) / (s.efficiency / 100));
    return {
      plotId,
      shouldIrrigate: m < s.minMoisture,
      recommendedAt: iso(now() + (m < s.criticalMoisture ? 0.25 : 3) * H),
      waterL,
      runtimeMin: Math.min(s.maxRuntimeMin, Math.round(waterL / s.flowRateLpm)),
      priority: m < s.criticalMoisture ? "high" : m < s.minMoisture ? "medium" : "low",
      reason:
        m < s.minMoisture
          ? `Soil moisture ${m}% is below the minimum ${s.minMoisture}%. No significant rain forecast.`
          : `Soil moisture ${m}% is within range. No irrigation needed now.`,
      predictionType: "rule_based",
    };
  },

  pump: (plotId: string) => ({ ...pumps[plotId], command: pumps[plotId].command ? { ...pumps[plotId].command! } : null }),

  sendCommand(plotId: string, action: "start" | "stop" | "emergency_stop") {
    const p = pumps[plotId];
    const dev = devices.find((d) => d.plotId === plotId);
    const id = "cmd-" + Math.random().toString(36).slice(2, 8);
    p.command = { id, action, status: "pending", updatedAt: iso(now()) };
    emitDemoEvent({ type: "pump.command_updated", plotId });
    const step = (status: PumpState["command"] extends infer C ? C extends { status: infer S } ? S : never : never, delay: number, after?: () => void) =>
      setTimeout(() => {
        if (p.command?.id !== id) return;
        p.command.status = status;
        p.command.updatedAt = iso(now());
        after?.();
        emitDemoEvent({ type: "pump.command_updated", plotId });
        emitDemoEvent({ type: "pump.status_changed", plotId });
      }, delay);

    if (!dev?.online) {
      step("expired", 4000);
      return p.command;
    }
    step("acknowledged", 1200);
    if (action === "start") {
      const d = demo.decision(plotId);
      step("executing", 2600, () => {
        p.confirmedOn = true;
        p.sessionId = "s-" + id;
        p.remainingL = Math.max(d.waterL, 400);
        p.deliveredL = 0;
        p.runtimeSec = 0;
        p.progress = 0;
        tick(plotId, id);
      });
    } else {
      step("completed", 2400, () => {
        p.confirmedOn = false;
        p.sessionId = null;
      });
    }
    return p.command;
  },

  sessions(plotId: string): IrrigationSession[] {
    const s = settings[plotId];
    const out: IrrigationSession[] = [];
    const statuses: IrrigationSession["status"][] = ["completed", "completed", "missed", "completed", "postponed", "completed", "completed"];
    for (let i = 7; i >= 1; i--) {
      out.push({ id: `${plotId}-h${i}`, plotId, startedAt: iso(now() - i * 24 * H + 6 * H), durationMin: 40 + i * 3, waterL: (40 + i * 3) * s.flowRateLpm, status: statuses[i - 1], measurement: "estimated" });
    }
    for (let i = 0; i < 3; i++) {
      out.push({ id: `${plotId}-u${i}`, plotId, startedAt: iso(now() + (i + 1) * 24 * H - 2 * H), durationMin: 45, waterL: 45 * s.flowRateLpm, status: "upcoming", measurement: "estimated" });
    }
    return out;
  },

  water(plotId: string | "all", days = 14): WaterAnalytics {
    const r = rng((plotId === "all" ? 7 : plotId.charCodeAt(1)) + days);
    const daily = Array.from({ length: days }, (_, i) => {
      const d = new Date(now() - (days - 1 - i) * 24 * H);
      const required = Math.round(1800 + r() * 900);
      return { date: d.toISOString().slice(0, 10), required, actual: Math.round(required * (0.75 + r() * 0.45)) };
    });
    const weekly = Array.from({ length: 8 }, (_, i) => ({ week: `W${i + 1}`, liters: Math.round(12000 + r() * 6000) }));
    const monthly = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m) => ({ month: m, liters: Math.round(45000 + r() * 25000) }));
    const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
    const weekL = sum(daily.slice(-7).map((d) => d.actual));
    return {
      todayL: daily[daily.length - 1].actual,
      weekL,
      monthL: monthly[monthly.length - 1].liters,
      sessions: 23,
      avgPerSessionL: Math.round(weekL / 6),
      perAcreL: Math.round(weekL / 5.5),
      measurement: "estimated",
      daily,
      weekly,
      monthly,
    };
  },

  alerts: () => alerts.map((a) => ({ ...a })),
  resolveAlert(id: string) {
    alerts = alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a));
  },

  devices: () => devices.map((d) => ({ ...d, lastHeartbeat: d.online ? iso(now() - 20_000) : d.lastHeartbeat })),
  assignDevice(deviceId: string, plotId: string | null) {
    devices.forEach((d) => {
      if (plotId && d.plotId === plotId) d.plotId = null;
    });
    const d = devices.find((x) => x.id === deviceId);
    if (d) d.plotId = plotId;
    plots.forEach((p) => {
      if (p.deviceId === deviceId) p.deviceId = null;
    });
    const p = plots.find((x) => x.id === plotId);
    if (p) p.deviceId = deviceId;
  },
};

function tick(plotId: string, cmdId: string) {
  const p = pumps[plotId];
  const iv = setInterval(() => {
    if (!p.confirmedOn || p.command?.id !== cmdId && p.command?.action === "start") {
      clearInterval(iv);
      return;
    }
    if (!p.confirmedOn) return clearInterval(iv);
    p.runtimeSec += 5;
    const flowPer5s = (settings[plotId].flowRateLpm / 60) * 5 * 20; // demo time-acceleration ×20
    p.deliveredL = Math.min(p.deliveredL + flowPer5s, p.deliveredL + p.remainingL);
    p.remainingL = Math.max(0, p.remainingL - flowPer5s);
    const total = p.deliveredL + p.remainingL;
    p.progress = total ? Math.round((p.deliveredL / total) * 100) : 100;
    if (p.remainingL <= 0) {
      p.confirmedOn = false;
      p.sessionId = null;
      p.command = p.command ? { ...p.command, status: "completed", updatedAt: iso(now()) } : null;
      clearInterval(iv);
    }
    emitDemoEvent({ type: "pump.status_changed", plotId });
  }, 5000);
}
