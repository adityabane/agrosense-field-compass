import type { AreaUnit, CropType, IrrigationSettings } from "@/types";

/**
 * Suggested starting thresholds per crop. These are generic guide values and
 * MUST be calibrated locally for soil, climate and sensor placement.
 */
export const cropDefaults: Record<CropType, IrrigationSettings> = {
  sugarcane: { minMoisture: 30, targetMoisture: 45, criticalMoisture: 20, tempMin: 18, tempMax: 38, humidityMin: 40, humidityMax: 85, rainfallThreshold: 8, efficiency: 85, flowRateLpm: 40, maxRuntimeMin: 120, minOffMin: 60, autoMode: false },
  wheat: { minMoisture: 25, targetMoisture: 38, criticalMoisture: 15, tempMin: 10, tempMax: 30, humidityMin: 35, humidityMax: 80, rainfallThreshold: 5, efficiency: 75, flowRateLpm: 35, maxRuntimeMin: 90, minOffMin: 90, autoMode: false },
};

export const cropInfo: Record<CropType, { label: string; stages: string[]; waterNeed: string }> = {
  sugarcane: { label: "Sugarcane", stages: ["Germination", "Tillering", "Grand growth", "Maturity"], waterNeed: "1,500–2,500 mm per season" },
  wheat: { label: "Wheat", stages: ["Crown root initiation", "Tillering", "Jointing", "Flowering", "Milking", "Dough", "Maturity"], waterNeed: "450–650 mm per season" },
};

export function toAcres(area: number, unit: AreaUnit) {
  if (unit === "hectares") return area * 2.47105;
  if (unit === "sqm") return area / 4046.86;
  return area;
}

export const unitLabel: Record<AreaUnit, string> = { acres: "ac", hectares: "ha", sqm: "m²" };

export function formatLiters(l: number) {
  if (l >= 1000) return `${(l / 1000).toFixed(1)} kL`;
  return `${Math.round(l)} L`;
}

export function timeAgo(isoStr: string | null) {
  if (!isoStr) return "never";
  const s = Math.round((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (s < 60) return `${Math.max(s, 0)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export const STALE_AFTER_MS = 10 * 60_000;
export const isStale = (isoStr: string | null) => !isoStr || Date.now() - new Date(isoStr).getTime() > STALE_AFTER_MS;
