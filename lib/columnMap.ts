export type RowField =
  | "fecha"
  | "cliente"
  | "cantidad"
  | "descripcion"
  | "propietario"
  | "expediente";

const COLUMN_ALIASES: Record<RowField, string[]> = {
  fecha: ["fecha", "date", "dia", "día", "fch"],
  cliente: ["cliente", "client", "customer", "empresa"],
  cantidad: [
    "cantidad",
    "horas",
    "hours",
    "qty",
    "tiempo",
    "duracion",
    "duración",
    "time",
    "hrs",
  ],
  descripcion: [
    "descripcion",
    "descripción",
    "description",
    "detalle",
    "actividad",
    "tarea",
    "concepto",
  ],
  propietario: ["propietario", "owner", "responsable", "asignado", "usuario"],
  expediente: ["expediente", "file", "caso", "matter", "ref", "referencia"],
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolveColumns(
  headers: string[]
): Record<RowField, number | null> {
  const normalized = headers.map(normalizeHeader);
  const result: Record<RowField, number | null> = {
    fecha: null,
    cliente: null,
    cantidad: null,
    descripcion: null,
    propietario: null,
    expediente: null,
  };

  for (const field of Object.keys(COLUMN_ALIASES) as RowField[]) {
    const aliases = COLUMN_ALIASES[field].map(normalizeHeader);
    const index = normalized.findIndex((h) => aliases.includes(h));
    if (index !== -1) {
      result[field] = index;
    }
  }

  return result;
}

export function getRequiredColumnsMissing(
  columns: Record<RowField, number | null>
): string[] {
  const missing: string[] = [];
  if (columns.fecha === null) missing.push("Fecha");
  if (columns.cliente === null) missing.push("Cliente");
  if (columns.cantidad === null) missing.push("Cantidad/Horas");
  return missing;
}
