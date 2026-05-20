import { parseISO, isAfter, isBefore, isEqual, startOfDay, endOfDay } from "date-fns";
import type {
  Activity,
  ClientGroup,
  ClientMonthGroup,
  FilterOptions,
  Filters,
  MonthGroup,
} from "./types";
import { formatMonthLabel, monthKey } from "./format";

export function filterActivities(
  data: Activity[],
  filters: Filters
): Activity[] {
  return data.filter((activity) => {
    if (filters.monthKeys.length > 0) {
      const key = monthKey(activity.mes, activity.anio);
      if (!filters.monthKeys.includes(key)) return false;
    }

    if (
      filters.clientes.length > 0 &&
      !filters.clientes.includes(activity.cliente_final)
    ) {
      return false;
    }

    if (filters.fechaDesde) {
      const desde = startOfDay(parseISO(filters.fechaDesde));
      const fecha = parseISO(activity.fecha);
      if (isBefore(fecha, desde) && !isEqual(fecha, desde)) return false;
    }

    if (filters.fechaHasta) {
      const hasta = endOfDay(parseISO(filters.fechaHasta));
      const fecha = parseISO(activity.fecha);
      if (isAfter(fecha, hasta) && !isEqual(fecha, hasta)) return false;
    }

    return true;
  });
}

export function totalHoras(data: Activity[]): number {
  return data.reduce((sum, a) => sum + a.horas, 0);
}

export function groupByMonth(data: Activity[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();

  for (const activity of data) {
    const key = monthKey(activity.mes, activity.anio);
    const existing = map.get(key);
    if (existing) {
      existing.horas += activity.horas;
    } else {
      map.set(key, {
        mes: activity.mes,
        anio: activity.anio,
        label: formatMonthLabel(activity.mes, activity.anio),
        horas: activity.horas,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
  );
}

export function groupByClient(data: Activity[]): ClientGroup[] {
  const map = new Map<string, number>();

  for (const activity of data) {
    map.set(activity.cliente_final, (map.get(activity.cliente_final) ?? 0) + activity.horas);
  }

  return Array.from(map.entries())
    .map(([cliente, horas]) => ({ cliente, horas }))
    .sort((a, b) => b.horas - a.horas);
}

export function groupByClientAndMonth(data: Activity[]): ClientMonthGroup[] {
  const map = new Map<string, ClientMonthGroup>();

  for (const activity of data) {
    const key = `${activity.cliente_final}|${monthKey(activity.mes, activity.anio)}`;
    const existing = map.get(key);
    if (existing) {
      existing.horas += activity.horas;
    } else {
      map.set(key, {
        cliente: activity.cliente_final,
        mes: activity.mes,
        anio: activity.anio,
        label: formatMonthLabel(activity.mes, activity.anio),
        horas: activity.horas,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.cliente !== b.cliente) return a.cliente.localeCompare(b.cliente);
    if (a.anio !== b.anio) return a.anio - b.anio;
    return a.mes - b.mes;
  });
}

export function getFilterOptions(data: Activity[]): FilterOptions {
  const monthSet = new Map<string, FilterOptions["meses"][0]>();
  const clientSet = new Set<string>();

  for (const activity of data) {
    const key = monthKey(activity.mes, activity.anio);
    if (!monthSet.has(key)) {
      monthSet.set(key, {
        mes: activity.mes,
        anio: activity.anio,
        label: formatMonthLabel(activity.mes, activity.anio),
        key,
      });
    }
    clientSet.add(activity.cliente_final);
  }

  return {
    meses: Array.from(monthSet.values()).sort((a, b) =>
      a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
    ),
    clientes: Array.from(clientSet).sort((a, b) => a.localeCompare(b)),
  };
}

export function getDistinctMonths(data: Activity[]): number {
  return new Set(data.map((a) => monthKey(a.mes, a.anio))).size;
}

export function getDistinctClients(data: Activity[]): number {
  return new Set(data.map((a) => a.cliente_final)).size;
}
