"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFilteredData } from "@/lib/hooks/useFilteredData";
import { useHorasStore } from "@/lib/store";

export function FilterPanel() {
  const filters = useHorasStore((s) => s.filters);
  const setFilters = useHorasStore((s) => s.setFilters);
  const resetFilters = useHorasStore((s) => s.resetFilters);
  const { options } = useFilteredData();

  const toggleMonth = (key: string) => {
    const next = filters.monthKeys.includes(key)
      ? filters.monthKeys.filter((k) => k !== key)
      : [...filters.monthKeys, key];
    setFilters({ monthKeys: next });
  };

  const toggleCliente = (cliente: string) => {
    const next = filters.clientes.includes(cliente)
      ? filters.clientes.filter((c) => c !== cliente)
      : [...filters.clientes, cliente];
    setFilters({ clientes: next });
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rango de fechas</Label>
          <div className="grid gap-2">
            <Input
              type="date"
              value={filters.fechaDesde ?? ""}
              onChange={(e) =>
                setFilters({ fechaDesde: e.target.value || undefined })
              }
              placeholder="Desde"
            />
            <Input
              type="date"
              value={filters.fechaHasta ?? ""}
              onChange={(e) =>
                setFilters({ fechaHasta: e.target.value || undefined })
              }
              placeholder="Hasta"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Mes</Label>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {options.meses.map(({ key, label }) => (
              <Checkbox
                key={key}
                label={label}
                checked={filters.monthKeys.includes(key)}
                onChange={() => toggleMonth(key)}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Cliente</Label>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {options.clientes.map((cliente) => (
              <Checkbox
                key={cliente}
                label={cliente}
                checked={filters.clientes.includes(cliente)}
                onChange={() => toggleCliente(cliente)}
              />
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  );
}
