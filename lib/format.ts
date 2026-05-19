import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatHoras(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded.toLocaleString("es-AR", { minimumFractionDigits: rounded % 1 === 0 ? 0 : 1, maximumFractionDigits: 1 })} h`;
}

export function formatFecha(fecha: string): string {
  try {
    return format(parseISO(fecha), "dd/MM/yyyy");
  } catch {
    return fecha;
  }
}

export function formatMonthLabel(mes: number, anio: number): string {
  const date = new Date(anio, mes - 1, 1);
  return format(date, "MMM yyyy", { locale: es });
}

export function monthKey(mes: number, anio: number): string {
  return `${anio}-${String(mes).padStart(2, "0")}`;
}
