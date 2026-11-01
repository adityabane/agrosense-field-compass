import { z } from "zod";

export const plotSchema = z.object({
  name: z.string().trim().min(2, "Enter a plot name").max(60),
  area: z.coerce.number().positive("Area must be greater than 0").max(100000),
  areaUnit: z.enum(["acres", "hectares", "sqm"]),
  crop: z.enum(["sugarcane", "wheat"]),
  cropVariety: z.string().trim().min(1, "Enter the variety").max(60),
  soilType: z.string().trim().min(1, "Enter soil type").max(60),
  location: z.string().trim().min(1, "Enter location").max(120),
  irrigationMethod: z.enum(["drip", "sprinkler", "flood"]),
  sowingDate: z.string().min(1, "Pick a sowing date"),
  growthStage: z.string().min(1, "Choose a growth stage"),
});
export type PlotForm = z.infer<typeof plotSchema>;

export const settingsSchema = z
  .object({
    minMoisture: z.coerce.number().min(0).max(100),
    targetMoisture: z.coerce.number().min(0).max(100),
    criticalMoisture: z.coerce.number().min(0).max(100),
    tempMin: z.coerce.number().min(-20).max(60),
    tempMax: z.coerce.number().min(-20).max(60),
    humidityMin: z.coerce.number().min(0).max(100),
    humidityMax: z.coerce.number().min(0).max(100),
    rainfallThreshold: z.coerce.number().min(0).max(500),
    efficiency: z.coerce.number().min(10).max(100),
    flowRateLpm: z.coerce.number().positive().max(10000),
    maxRuntimeMin: z.coerce.number().int().min(1).max(600),
    minOffMin: z.coerce.number().int().min(0).max(1440),
    autoMode: z.boolean(),
  })
  .refine((s) => s.criticalMoisture < s.minMoisture && s.minMoisture < s.targetMoisture, {
    message: "Must be: critical < minimum < target",
    path: ["minMoisture"],
  })
  .refine((s) => s.tempMin < s.tempMax, { message: "Min must be below max", path: ["tempMax"] })
  .refine((s) => s.humidityMin < s.humidityMax, { message: "Min must be below max", path: ["humidityMax"] });
