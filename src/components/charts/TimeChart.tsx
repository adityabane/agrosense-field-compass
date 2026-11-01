// @ts-nocheck
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fmtTime = (t: string) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function TimeChart<T extends { t: string }>({ data, dataKey, unit, color = "var(--chart-1)", height = 140 }: { data: T[]; dataKey: keyof T & string; unit: string; color?: string; height?: number }) {
  const id = `g-${dataKey}`;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="t" tickFormatter={fmtTime} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={40} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, background: "var(--card)" }}
            labelFormatter={(l) => new Date(l as string).toLocaleString()}
            formatter={(v) => [`${v} ${unit}`, ""]}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const tooltipStyle = { borderRadius: 12, border: "1px solid var(--border)", fontSize: 12, background: "var(--card)" };
export const axisTick = { fontSize: 10, fill: "var(--muted-foreground)" };
