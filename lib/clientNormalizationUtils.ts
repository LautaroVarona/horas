/**
 * Utilidades para normalización de clientes
 * Funciones reutilizables para análisis y agrupación
 */

import {
  extractClienteKey,
  inferFromNombreExpediente,
  normalizeClienteFinal,
  normalizeSuffix,
} from "./normalizers";
import type { Activity } from "./types";

/**
 * Agrupa actividades por cliente usando la key normalizada (BONUS)
 * Detecta variantes del mismo cliente: "HEALTHCARE FOAM S.L", "HEALTHCARE FOAM, S.L.U" → "HEALTHCARE FOAM"
 */
export function groupByClientKey(
  data: Activity[]
): Record<string, { key: string; clientes: string[]; horas: number }> {
  const map = new Map<
    string,
    { key: string; clientes: Set<string>; horas: number }
  >();

  for (const activity of data) {
    const key = extractClienteKey(activity.cliente_final);
    const existing = map.get(key);

    if (existing) {
      existing.clientes.add(activity.cliente_final);
      existing.horas += activity.horas;
    } else {
      map.set(key, {
        key,
        clientes: new Set([activity.cliente_final]),
        horas: activity.horas,
      });
    }
  }

  const result: Record<string, { key: string; clientes: string[]; horas: number }> = {};
  for (const [key, value] of map) {
    result[key] = {
      key,
      clientes: Array.from(value.clientes),
      horas: value.horas,
    };
  }

  return result;
}

/**
 * Exporta un resumen de normalización de clientes
 * Útil para debugging y verificación
 */
export function generateClienteNormalizationReport(data: Activity[]): {
  original: Map<string, { origen: string; final: string; count: number }>;
  conGrupo: Array<{ origen: string; final: string; fromExpediente: boolean }>;
  sinGrupo: Array<{ cliente: string; count: number }>;
} {
  const original = new Map<
    string,
    { origen: string; final: string; count: number }
  >();
  const conGrupo: Array<{ origen: string; final: string; fromExpediente: boolean }> = [];
  const sinGrupoMap = new Map<string, number>();

  for (const activity of data) {
    // Agregar al mapa de original → final
    const key = `${activity.cliente_origen}|${activity.cliente_final}`;
    const existing = original.get(key);
    if (existing) {
      existing.count++;
    } else {
      original.set(key, {
        origen: activity.cliente_origen,
        final: activity.cliente_final,
        count: 1,
      });

      // Registrar si fue normalizado desde GRUPO
      if (activity.cliente_origen.toUpperCase().includes("GRUPO")) {
        conGrupo.push({
          origen: activity.cliente_origen,
          final: activity.cliente_final,
          fromExpediente: activity.cliente_origen !== activity.cliente_final,
        });
      } else {
        sinGrupoMap.set(activity.cliente_final, (sinGrupoMap.get(activity.cliente_final) ?? 0) + 1);
      }
    }
  }

  return {
    original,
    conGrupo: [...new Map(conGrupo.map((x) => [`${x.origen}|${x.final}`, x])).values()],
    sinGrupo: Array.from(sinGrupoMap.entries()).map(([cliente, count]) => ({
      cliente,
      count,
    })),
  };
}

// Exportar todas las funciones de normalización para uso externo
export { extractClienteKey, inferFromNombreExpediente, normalizeClienteFinal, normalizeSuffix };
