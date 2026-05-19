"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHoras } from "@/lib/format";
import { useFilteredData } from "@/lib/hooks/useFilteredData";
import { useHorasStore } from "@/lib/store";
import { Calendar, Clock, Users, List } from "lucide-react";

export function StatsCards() {
  const isLoading = useHorasStore((s) => s.isLoading);
  const { stats } = useFilteredData();

  const cards = [
    {
      title: "Total horas",
      value: formatHoras(stats.totalHoras),
      icon: Clock,
    },
    {
      title: "Actividades",
      value: stats.activityCount.toString(),
      icon: List,
    },
    {
      title: "Clientes",
      value: stats.clientCount.toString(),
      icon: Users,
    },
    {
      title: "Meses",
      value: stats.monthCount.toString(),
      icon: Calendar,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
