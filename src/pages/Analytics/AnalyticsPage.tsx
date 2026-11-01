import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQueries } from "@tanstack/react-query";
import { Droplets } from "lucide-react";
import { CardsSkeleton, EstimatedTag, PageHeader, Panel, Stat } from "@/components/ui/agro";
import { axisTick, tooltipStyle } from "@/components/charts/TimeChart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlotCtx } from "@/contexts/PlotContext";
import { qk, useWater } from "@/hooks/queries";
import { analyticsApi } from "@/services/api";
import { formatLiters } from "@/utils/agronomy";

function ChartBox({ children, h = 220 }: { children: React.ReactElement; h?: number }) {
  return <div style={{ height: h }}><ResponsiveContainer>{children}</ResponsiveContainer></div>;
}

export function AnalyticsPage() {
  const { plotId, plots } = usePlotCtx();
  const [days, setDays] = useState(14);
  const { data: w } = useWater(plotId, days);
  const compare = useQueries({ queries: plots.map((p) => ({ queryKey: qk.water(p.id, days), queryFn: () => analyticsApi.water(p.id, days), staleTime: 5 * 60_000 })) });
  const cmpData = plots.map((p, i) => ({ name: p.name, liters: compare[i]?.data?.weekL ?? 0 }));

  return (
    <>
      <PageHeader
        title="Water analytics"
        subtitle={<span className="inline-flex items-center gap-2">No flow sensor installed — all values are <EstimatedTag /></span>}
        action={
          <Tabs value={String(days)} onValueChange={(v) => setDays(+v)}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="14">14d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      {!w ? <CardsSkeleton n={6} className="lg:grid-cols-6" /> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Today" value={formatLiters(w.todayL)} icon={<Droplets className="size-4" />} />
          <Stat label="This week" value={formatLiters(w.weekL)} />
          <Stat label="This month" value={formatLiters(w.monthL)} />
          <Stat label="Sessions" value={w.sessions} />
          <Stat label="Avg / session" value={formatLiters(w.avgPerSessionL)} />
          <Stat label="Per acre (week)" value={formatLiters(w.perAcreL)} />
        </div>
      )}
      {w && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Daily consumption" action={<EstimatedTag />}>
            <ChartBox>
              <BarChart data={w.daily} margin={{ left: -16, right: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={axisTick} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="actual" name="Litres (est.)" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartBox>
          </Panel>
          <Panel title="Required vs. delivered" action={<EstimatedTag />}>
            <ChartBox>
              <LineChart data={w.daily} margin={{ left: -16, right: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={axisTick} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="required" name="Required" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
                <Line dataKey="actual" name="Delivered" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartBox>
          </Panel>
          <Panel title="Weekly trend">
            <ChartBox h={200}>
              <LineChart data={w.weekly} margin={{ left: -16, right: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="liters" name="Litres (est.)" stroke="var(--chart-2)" strokeWidth={2.5} />
              </LineChart>
            </ChartBox>
          </Panel>
          <Panel title="Monthly trend">
            <ChartBox h={200}>
              <BarChart data={w.monthly} margin={{ left: -16, right: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" name="Litres (est.)" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartBox>
          </Panel>
          <Panel title="Plot comparison · last 7 days" className="lg:col-span-2" action={<EstimatedTag />}>
            <ChartBox h={200}>
              <BarChart data={cmpData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" name="Litres (est.)" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartBox>
          </Panel>
        </div>
      )}
    </>
  );
}
