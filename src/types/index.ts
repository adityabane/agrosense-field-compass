export type DataSource = "hardware" | "simulated";
export type Level = "normal" | "warning" | "critical" | "unknown";
export type CropType = "sugarcane" | "wheat";
export type AreaUnit = "acres" | "hectares" | "sqm";
export type IrrigationMethod = "drip" | "sprinkler" | "flood";
export type CommandStatus = "pending" | "acknowledged" | "executing" | "completed" | "failed" | "expired";

export interface Plot {
  id: string;
  name: string;
  area: number;
  areaUnit: AreaUnit;
  crop: CropType;
  cropVariety: string;
  soilType: string;
  location: string;
  irrigationMethod: IrrigationMethod;
  sowingDate: string;
  growthStage: string;
  active: boolean;
  deviceId: string | null;
}

export type PlotInput = Omit<Plot, "id" | "active" | "deviceId">;

export interface SensorReading {
  key: "soil_moisture" | "temperature" | "humidity" | "rainfall";
  value: number | null;
  unit: string;
  level: Level;
  threshold: string;
  recordedAt: string | null;
  source: DataSource;
}

export interface SensorHistoryPoint {
  t: string;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Device {
  id: string;
  name: string;
  plotId: string | null;
  online: boolean;
  lastHeartbeat: string;
  rssi: number;
  firmware: string;
  health: "good" | "degraded" | "faulty";
}

export interface PumpState {
  plotId: string;
  confirmedOn: boolean;
  mode: "auto" | "manual";
  sessionId: string | null;
  progress: number;
  deliveredL: number;
  remainingL: number;
  runtimeSec: number;
  command: { id: string; action: "start" | "stop" | "emergency_stop"; status: CommandStatus; updatedAt: string } | null;
}

export interface IrrigationDecision {
  plotId: string;
  shouldIrrigate: boolean;
  recommendedAt: string;
  waterL: number;
  runtimeMin: number;
  priority: "low" | "medium" | "high";
  reason: string;
  predictionType: "rule_based";
}

export interface IrrigationSettings {
  minMoisture: number;
  targetMoisture: number;
  criticalMoisture: number;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  rainfallThreshold: number;
  efficiency: number;
  flowRateLpm: number;
  maxRuntimeMin: number;
  minOffMin: number;
  autoMode: boolean;
}

export interface IrrigationSession {
  id: string;
  plotId: string;
  startedAt: string;
  durationMin: number;
  waterL: number;
  status: "completed" | "upcoming" | "postponed" | "missed";
  measurement: "estimated" | "measured";
}

export interface WaterAnalytics {
  todayL: number;
  weekL: number;
  monthL: number;
  sessions: number;
  avgPerSessionL: number;
  perAcreL: number;
  measurement: "estimated" | "measured";
  daily: { date: string; actual: number; required: number }[];
  weekly: { week: string; liters: number }[];
  monthly: { month: string; liters: number }[];
}

export interface Alert {
  id: string;
  plotId: string | null;
  type:
    | "critical_moisture"
    | "irrigation_required"
    | "rain_detected"
    | "heavy_rain_forecast"
    | "temperature_limit"
    | "abnormal_humidity"
    | "pump_failure"
    | "device_offline"
    | "sensor_malfunction"
    | "low_water";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  createdAt: string;
  resolved: boolean;
}

export interface Weather {
  tempC: number;
  condition: string;
  rainChancePct: number;
  forecastMm: number;
}

export interface Overview {
  totalPlots: number;
  totalAreaAcres: number;
  activeIrrigation: number;
  plotsNeedingIrrigation: number;
  todayWaterL: number;
  upcomingSessions: number;
  weather: Weather | null;
}

export type SocketEvent =
  | { type: "sensor.updated"; plotId: string }
  | { type: "device.status_changed"; plotId: string }
  | { type: "pump.status_changed"; plotId: string }
  | { type: "pump.command_updated"; plotId: string }
  | { type: "alert.created"; plotId: string | null }
  | { type: "irrigation.decision_updated"; plotId: string };
