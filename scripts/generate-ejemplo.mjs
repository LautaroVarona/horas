import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const data = [
  ["Fecha", "Cliente", "Cantidad", "Descripción", "Propietario", "Expediente"],
  ["15/01/2026", "Acme Corp", "2:30 h", "Revisión de contrato", "Juan Pérez", "EXP-001"],
  ["16/01/2026", "Beta SA", "1:00 h", "Llamada con cliente", "María López", "EXP-002"],
  ["20/01/2026", "Acme Corp", "3:00 h", "Redacción de informe", "Juan Pérez", "EXP-001"],
  ["22/01/2026", "Gamma LLC", "0:45 h", "Consulta rápida", "Juan Pérez", ""],
  ["28/01/2026", "Beta SA", "2:15 h", "Preparación de audiencia", "María López", "EXP-003"],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Enero");

const outPath = join(__dirname, "..", "public", "ejemplo-enero.xlsx");
writeFileSync(outPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Generado:", outPath);
