"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatHoras } from "@/lib/format";

interface ChartItem {
  name: string;
  horas: number;
}

interface HorasChartProps {
  data: ChartItem[];
  title: string;
  emptyMessage?: string;
}

export function HorasChart({
  data,
  title,
  emptyMessage = "No hay datos para mostrar.",
}: HorasChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/20">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={data.length > 6 ? -35 : 0}
            textAnchor={data.length > 6 ? "end" : "middle"}
            height={data.length > 6 ? 70 : 30}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => [formatHoras(value), "Horas"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}
          />
          <Bar dataKey="horas" fill="oklch(0.205 0 0)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function topClientsWithOthers(
  items: { cliente: string; horas: number }[],
  limit = 15
): ChartItem[] {
  if (items.length <= limit) {
    return items.map((i) => ({ name: i.cliente, horas: i.horas }));
  }
  const top = items.slice(0, limit);
  const othersHoras = items.slice(limit).reduce((s, i) => s + i.horas, 0);
  return [
    ...top.map((i) => ({ name: i.cliente, horas: i.horas })),
    { name: "Otros", horas: othersHoras },
  ];
}
