"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ActivitiesTable } from "@/components/dashboard/ActivitiesTable";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { GroupedTable } from "@/components/dashboard/GroupedTable";
import {
  HorasChart,
  topClientsWithOthers,
} from "@/components/dashboard/HorasChart";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilteredData } from "@/lib/hooks/useFilteredData";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useHasData } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const hasData = useHasData();
  const { filtered, byMonth, byClient, byClientAndMonth } = useFilteredData();

  useEffect(() => {
    if (!hydrated) return;
    if (!hasData) {
      router.replace("/upload");
    }
  }, [hasData, hydrated, router]);

  if (!hydrated || !hasData) {
    return (
      <AppShell>
        <p className="text-muted-foreground">Redirigiendo...</p>
      </AppShell>
    );
  }

  const monthChartData = byMonth.map((m) => ({
    name: m.label,
    horas: m.horas,
  }));

  const clientChartData = topClientsWithOthers(byClient);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Análisis de horas trabajadas con filtros dinámicos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <FilterPanel />
          <div className="space-y-6">
            <StatsCards />

            <div className="grid gap-6 md:grid-cols-2">
              <HorasChart
                data={monthChartData}
                title="Horas por mes"
              />
              <HorasChart
                data={clientChartData}
                title="Horas por cliente"
              />
            </div>

            <Tabs defaultValue="actividades">
              <TabsList>
                <TabsTrigger value="actividades">Actividades</TabsTrigger>
                <TabsTrigger value="cliente">Por cliente</TabsTrigger>
                <TabsTrigger value="mes">Por mes</TabsTrigger>
                <TabsTrigger value="cliente-mes">Cliente × mes</TabsTrigger>
              </TabsList>

              <TabsContent value="actividades" className="mt-4">
                <ActivitiesTable data={filtered} />
              </TabsContent>

              <TabsContent value="cliente" className="mt-4">
                <GroupedTable
                  col1Label="Cliente"
                  rows={byClient.map((c) => ({
                    label: c.cliente,
                    horas: c.horas,
                  }))}
                />
              </TabsContent>

              <TabsContent value="mes" className="mt-4">
                <GroupedTable
                  col1Label="Mes"
                  rows={byMonth.map((m) => ({
                    label: m.label,
                    horas: m.horas,
                  }))}
                />
              </TabsContent>

              <TabsContent value="cliente-mes" className="mt-4">
                <GroupedTable
                  col1Label="Cliente"
                  col2Label="Mes"
                  rows={byClientAndMonth.map((r) => ({
                    label: r.cliente,
                    sublabel: r.label,
                    horas: r.horas,
                  }))}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
