import { format, isValid, parse } from "date-fns";
import type { Activity } from "./types";
import type { RowField } from "./columnMap";

export function cleanCliente(value: unknown): string {
  if (value == null) return "";
  return String(value).trim().replace(/\s+/g, " ");
}

/**
 * Normaliza sufijos de entidad legal (S.L., S.L.U., etc.)
 * Casos cubiertos:
 * - "SL", "S L", "S.L" → "S.L."
 * - "SLU", "S L U", "S.L.U" → "S.L.U."
 */
export function normalizeSuffix(value: string): string {
  if (!value) return value;

  // Normalizar S.L. (Sociedad Limitada)
  const slRegex = /\b(s\.?\s*l\.?)\b/gi;
  let result = value.replace(slRegex, "S.L.");

  // Normalizar S.L.U. (Sociedad Limitada Unipersonal)
  const sluRegex = /\b(s\.?\s*l\.?\s*u\.?)\b/gi;
  result = result.replace(sluRegex, "S.L.U.");

  return result;
}

/**
 * Inferir cliente desde el nombre del expediente
 * - Trim
 * - Limpiar espacios dobles
 * - Normalizar sufijos de entidades legales
 */
export function inferFromNombreExpediente(expediente: string): string {
  if (!expediente) return "";

  // Trim y limpiar espacios dobles
  let cleaned = expediente.trim().replace(/\s+/g, " ");

  // Normalizar sufijos
  cleaned = normalizeSuffix(cleaned);

  return cleaned;
}

/**
 * Determina el cliente final basado en el cliente origen
 * Regla: Si cliente_origen contiene "GRUPO", inferir desde expediente
 * Si no, usar cliente_origen
 */
export function normalizeClienteFinal(
  cliente_origen: string,
  expediente: string | undefined
): string {
  if (!cliente_origen) return "";

  // Si contiene "GRUPO" (case insensitive), inferir del expediente
  if (cliente_origen.toUpperCase().includes("GRUPO")) {
    if (expediente) {
      const inferred = inferFromNombreExpediente(expediente);
      if (inferred) return inferred;
    }
    // Si no hay expediente o está vacío, retornar el cliente_origen limpio
    return cliente_origen;
  }

  // Si no contiene GRUPO, retornar cliente_origen como cliente_final
  return cliente_origen;
}

/**
 * Detecta y normaliza variantes del mismo cliente a una key única
 * Ej: "HEALTHCARE FOAM S.L", "HEALTHCARE FOAM, S.L.U" → "HEALTHCARE FOAM"
 * Esto es BONUS, se puede usar en agregaciones
 */
export function extractClienteKey(cliente: string): string {
  if (!cliente) return "";

  // Remover caracteres especiales como comas, puntos (excepto en sufijos)
  let key = cliente.trim();

  // Remover sufijos legales para agrupar variantes
  key = key.replace(/[,\s]*(S\.L\.U?\.?|S\.L\.)\s*$/gi, "").trim();

  // Limpiar espacios dobles nuevamente
  key = key.replace(/\s+/g, " ");

  return key;
}

export function parseHoras(value: unknown): number | null {
  if (value == null || value === "") return null;

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  let str = String(value).trim().toLowerCase();
  str = str.replace(/\s*h\s*$/i, "").trim();

  const hmMatch = str.match(/^(\d+)\s*[:h]\s*(\d+)\s*m?$/);
  if (hmMatch) {
    const hours = parseInt(hmMatch[1], 10);
    const minutes = parseInt(hmMatch[2], 10);
    return hours + minutes / 60;
  }

  const hMinMatch = str.match(/^(\d+)\s*h\s*(\d+)\s*m?$/);
  if (hMinMatch) {
    return parseInt(hMinMatch[1], 10) + parseInt(hMinMatch[2], 10) / 60;
  }

  const onlyH = str.match(/^(\d+(?:[.,]\d+)?)\s*h?$/);
  if (onlyH) {
    return parseFloat(onlyH[1].replace(",", "."));
  }

  const colonMatch = str.match(/^(\d+):(\d+)$/);
  if (colonMatch) {
    return parseInt(colonMatch[1], 10) + parseInt(colonMatch[2], 10) / 60;
  }

  const num = parseFloat(str.replace(",", "."));
  return Number.isNaN(num) ? null : num;
}

const EXCEL_EPOCH = new Date(1899, 11, 30);

export function parseFecha(value: unknown): Date | null {
  if (value == null || value === "") return null;

  if (value instanceof Date && isValid(value)) {
    return value;
  }

  if (typeof value === "number") {
    const date = new Date(EXCEL_EPOCH.getTime() + value * 86400000);
    return isValid(date) ? date : null;
  }

  const str = String(value).trim();

  const formats = ["dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "dd-MM-yyyy"];
  for (const fmt of formats) {
    const parsed = parse(str, fmt, new Date());
    if (isValid(parsed)) return parsed;
  }

  const native = new Date(str);
  if (isValid(native)) return native;

  return null;
}

function getCell(row: unknown[], index: number | null): unknown {
  if (index === null || index < 0 || index >= row.length) return undefined;
  return row[index];
}

export interface NormalizeMeta {
  sourceFile?: string;
}

export function normalizeActivity(
  row: unknown[],
  columns: Record<RowField, number | null>,
  meta: NormalizeMeta = {}
): Activity | null {
  const fechaRaw = getCell(row, columns.fecha);
  const clienteRaw = getCell(row, columns.cliente);
  const cantidadRaw = getCell(row, columns.cantidad);

  const fecha = parseFecha(fechaRaw);
  const cliente_origen = cleanCliente(clienteRaw);
  const horas = parseHoras(cantidadRaw);

  if (!fecha || !cliente_origen || horas === null || horas <= 0) {
    return null;
  }

  const descripcion =
    columns.descripcion !== null
      ? String(getCell(row, columns.descripcion) ?? "").trim()
      : "";

  const propietario =
    columns.propietario !== null
      ? cleanCliente(getCell(row, columns.propietario)) || undefined
      : undefined;

  const expediente =
    columns.expediente !== null
      ? String(getCell(row, columns.expediente) ?? "").trim() || undefined
      : undefined;

  const cliente_final = normalizeClienteFinal(cliente_origen, expediente);

  return {
    id: crypto.randomUUID(),
    fecha: format(fecha, "yyyy-MM-dd"),
    cliente: cliente_origen, // Mantener cliente_origen en campo 'cliente' para compatibilidad
    cliente_origen,
    cliente_final,
    horas,
    descripcion,
    propietario,
    expediente,
    mes: fecha.getMonth() + 1,
    anio: fecha.getFullYear(),
    sourceFile: meta.sourceFile,
  };
}
