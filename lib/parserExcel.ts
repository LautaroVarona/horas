import * as XLSX from "xlsx";
import {
  getRequiredColumnsMissing,
  resolveColumns,
} from "./columnMap";
import { normalizeActivity } from "./normalizers";
import type { Activity, ParseResult } from "./types";

export async function parseExcel(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const activities: Activity[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push(`${file.name}: el archivo no tiene hojas.`);
      return { activities, errors };
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as unknown[][];

    if (rows.length < 2) {
      errors.push(`${file.name}: no hay filas de datos.`);
      return { activities, errors };
    }

    const headerRow = rows[0].map((h) => String(h ?? ""));
    const columns = resolveColumns(headerRow);
    const missing = getRequiredColumnsMissing(columns);

    if (missing.length > 0) {
      errors.push(
        `${file.name}: faltan columnas requeridas (${missing.join(", ")}). Encabezados encontrados: ${headerRow.filter(Boolean).join(", ")}`
      );
      return { activities, errors };
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((cell) => cell === "" || cell == null)) continue;

      const activity = normalizeActivity(row, columns, {
        sourceFile: file.name,
      });
      if (activity) {
        activities.push(activity);
      }
    }

    if (activities.length === 0) {
      errors.push(
        `${file.name}: no se importaron filas válidas. Verificá Fecha, Cliente y Cantidad.`
      );
    }
  } catch (err) {
    errors.push(
      `${file.name}: error al leer el archivo — ${err instanceof Error ? err.message : "desconocido"}`
    );
  }

  return { activities, errors };
}
