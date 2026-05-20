import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Datos de ejemplo para probar la normalización de clientes
 * Incluye casos con "GRUPO" que deben ser normalizados
 */
const data = [
  ["Fecha", "Cliente", "Cantidad", "Descripción", "Propietario", "Expediente"],
  // Clientes normales
  ["15/01/2026", "Acme Corp S.L.", "2:30 h", "Revisión de contrato", "Juan Pérez", "EXP-001-Acme Corp"],
  ["16/01/2026", "Beta Healthcare S.L.U.", "1:00 h", "Llamada con cliente", "María López", "EXP-002-Beta Healthcare"],
  ["20/01/2026", "Acme Corp", "3:00 h", "Redacción de informe", "Juan Pérez", "EXP-001-Acme Corp"],
  ["22/01/2026", "Gamma LLC", "0:45 h", "Consulta rápida", "Juan Pérez", "EXP-003-Gamma LLC"],
  
  // Clientes con "GRUPO" - deben ser normalizados
  ["25/01/2026", "GRUPO CLIENTES VARIOS", "1:30 h", "Asesoramiento general", "Juan Pérez", "PROYECTO-HEALTHCARE-FOAM-S.L."],
  ["26/01/2026", "GRUPO MLILY EUROPE", "2:00 h", "Revisión de documentos", "María López", "Acme Solutions, S.L.U."],
  ["28/01/2026", "GRUPO DE CLIENTES EXTERNOS", "1:15 h", "Consultoría", "Carlos García", "BETA TECH SL"],
  ["30/01/2026", "GRUPO_INTERNO_VARIO", "0:50 h", "Seguimiento", "Juan Pérez", "PROYECTO GAMMA SOLUTIONS"],
  ["31/01/2026", "Beta SA", "2:15 h", "Preparación de audiencia", "María López", "EXP-003-Beta Healthcare"],
  
  // Más ejemplos con variantes
  ["02/02/2026", "HEALTHCARE FOAM, S.L.", "3:30 h", "Consultoría técnica", "Carlos García", "HEALTHCARE FOAM"],
  ["05/02/2026", "GRUPO MLILY EUROPE", "2:45 h", "Desarrollo", "Juan Pérez", "MLILY TECH S L"],
  ["08/02/2026", "GRUPO DE CORPORATIVOS", "1:20 h", "Asesoría", "María López", "INTERNATIONAL SOLUTIONS SLU"],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Datos");

const outPath = join(__dirname, "..", "public", "ejemplo-normalizacion.xlsx");
writeFileSync(outPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Generado archivo de prueba:", outPath);
console.log("\nCasos de prueba incluidos:");
console.log("1. Clientes normales (Acme Corp, Beta, Gamma)");
console.log("2. Clientes con 'GRUPO' que se normalizan desde expediente");
console.log("3. Variantes del mismo cliente (HEALTHCARE FOAM)");
console.log("4. Normalización de sufijos (S.L, S L, S.L.U, etc.)");
